"""FAQ intent classification for POST /predict-intent.

Loads a local joblib artifact when INTENT_MODEL_PATH is set, otherwise trains a
classical TF-IDF + LogisticRegression model from curated FAQ questions and
paraphrases (same feature recipe as experiments/scripts/train_classical_intent.py).
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Any

from config import get_settings
from services import faq_store

_API_ROOT = Path(__file__).resolve().parents[1]
# Local: apps/api → repo root. Docker image copies API to /app (no repo parent).
_REPO_ROOT = (
    _API_ROOT.parents[1] if len(_API_ROOT.parents) > 1 else _API_ROOT
)
_DEFAULT_ARTIFACT = (
    _REPO_ROOT / "experiments" / "artifacts" / "classical_tfidf_logreg.joblib"
)
_LOAD_LOCK = Lock()


@dataclass(frozen=True)
class IntentHit:
    faq_id: str
    category: str
    score: float


@dataclass
class IntentModel:
    pipeline: Any
    label_encoder: object | None
    model_name: str
    id_to_category: dict[str, str]


def _resolve_model_path() -> Path | None:
    settings = get_settings()
    raw = (settings.intent_model_path or "").strip()
    if raw:
        path = Path(raw)
        if not path.is_absolute():
            path = (_API_ROOT / path).resolve()
        return path if path.is_file() else None
    if _DEFAULT_ARTIFACT.is_file():
        return _DEFAULT_ARTIFACT
    return None


def _build_classical_pipeline() -> Any:
    # Import here so FAQ / medicine routes still start if sklearn is not installed.
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline

    return Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=1,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=2000,
                    solver="lbfgs",
                    C=2.0,
                ),
            ),
        ]
    )


def _training_rows() -> tuple[list[str], list[str], dict[str, str]]:
    texts: list[str] = []
    labels: list[str] = []
    id_to_category: dict[str, str] = {}
    for faq in faq_store.list_faqs():
        id_to_category[faq.id] = faq.category
        for raw in [faq.questionPs, *faq.paraphrasesPs]:
            text = (raw or "").strip()
            if text:
                texts.append(text)
                labels.append(faq.id)
    if not texts:
        raise RuntimeError("No FAQ training utterances available for intent model")
    return texts, labels, id_to_category


def _train_from_faqs() -> IntentModel:
    texts, labels, id_to_category = _training_rows()
    pipeline = _build_classical_pipeline()
    pipeline.fit(texts, labels)
    return IntentModel(
        pipeline=pipeline,
        label_encoder=None,
        model_name="tfidf_char_wb_logreg",
        id_to_category=id_to_category,
    )


def _category_map() -> dict[str, str]:
    return {faq.id: faq.category for faq in faq_store.list_faqs()}


def _load_joblib(path: Path) -> IntentModel:
    import joblib  # optional artifact path; FAQ-trained path does not need it

    payload = joblib.load(path)
    if not isinstance(payload, dict) or "pipeline" not in payload:
        raise ValueError(f"Unexpected intent artifact format: {path}")
    model_name = str(payload.get("model") or path.stem)
    return IntentModel(
        pipeline=payload["pipeline"],
        label_encoder=payload.get("labelEncoder"),
        model_name=model_name,
        id_to_category=_category_map(),
    )


@lru_cache
def _get_model() -> IntentModel:
    path = _resolve_model_path()
    if path is not None:
        try:
            return _load_joblib(path)
        except Exception as exc:  # noqa: BLE001 — fall back to FAQ-trained model
            print(f"Intent artifact load failed ({path}): {exc}", flush=True)
    return _train_from_faqs()


def clear_cache() -> None:
    """Drop the cached model (useful after FAQ edits in development)."""
    with _LOAD_LOCK:
        _get_model.cache_clear()


def ensure_loaded() -> str:
    """Warm the model and return its name."""
    with _LOAD_LOCK:
        return _get_model().model_name


def predict(text: str, *, top_k: int = 3) -> tuple[list[IntentHit], str]:
    """Rank FAQ intents for a typed (or transcribed) utterance."""
    cleaned = (text or "").strip()
    if not cleaned:
        raise ValueError("text must be non-empty")
    if top_k < 1:
        raise ValueError("top_k must be >= 1")

    with _LOAD_LOCK:
        model = _get_model()

    pipeline = model.pipeline
    encoder = model.label_encoder
    proba = pipeline.predict_proba([cleaned])[0]
    classes = list(pipeline.named_steps["clf"].classes_)

    ranked_idx = sorted(range(len(classes)), key=lambda i: proba[i], reverse=True)
    hits: list[IntentHit] = []
    for i in ranked_idx[:top_k]:
        raw_label = classes[i]
        if encoder is not None:
            faq_id = str(encoder.inverse_transform([raw_label])[0])
        else:
            faq_id = str(raw_label)
        hits.append(
            IntentHit(
                faq_id=faq_id,
                category=model.id_to_category.get(faq_id, "unknown"),
                score=round(float(proba[i]), 4),
            )
        )
    return hits, model.model_name
