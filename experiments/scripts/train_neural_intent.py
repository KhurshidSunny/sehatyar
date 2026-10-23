"""Train a small TF-IDF + MLP FAQ intent baseline on the fixed split.

Run from repo root:

  python experiments/scripts/train_neural_intent.py

Uses the same intent_{train,test}.jsonl split as the classical baseline and
writes metrics plus a short comparison under experiments/results/.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import joblib
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_DIR = REPO_ROOT / "experiments" / "data"
DEFAULT_RESULTS_DIR = REPO_ROOT / "experiments" / "results"
DEFAULT_ARTIFACTS_DIR = REPO_ROOT / "experiments" / "artifacts"
CLASSICAL_METRICS_NAME = "classical_tfidf_logreg_metrics.json"

# Same char n-gram TF-IDF as classical, then SVD so MLP trains on dense features.
HIDDEN_LAYERS = (128, 64)
SVD_COMPONENTS = 128
MLP_MAX_ITER = 500
RANDOM_STATE = 42


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def top_k_accuracy(
    clf: Pipeline,
    label_encoder: LabelEncoder,
    texts: list[str],
    y_true: list[str],
    k: int,
) -> float:
    classes = list(label_encoder.classes_)
    if k <= 1:
        preds = label_encoder.inverse_transform(clf.predict(texts))
        return float(accuracy_score(y_true, preds))

    # MLP classes_ are integer codes after LabelEncoder; map back to faqId strings.
    proba = clf.predict_proba(texts)
    code_to_label = {int(code): label for code, label in enumerate(classes)}
    hits = 0
    for i, true_label in enumerate(y_true):
        ranked = np.argsort(proba[i])[::-1][:k]
        if true_label in {code_to_label[int(j)] for j in ranked}:
            hits += 1
    return hits / len(y_true) if y_true else 0.0


def per_category_accuracy(
    y_true: list[str],
    y_pred: list[str],
    id_to_category: dict[str, str],
) -> dict[str, dict[str, float | int]]:
    buckets: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for true_id, pred_id in zip(y_true, y_pred):
        cat = id_to_category.get(true_id, "unknown")
        buckets[cat].append((true_id, pred_id))

    out: dict[str, dict[str, float | int]] = {}
    for cat, pairs in sorted(buckets.items()):
        correct = sum(1 for t, p in pairs if t == p)
        out[cat] = {
            "n": len(pairs),
            "accuracy": round(correct / len(pairs), 4) if pairs else 0.0,
        }
    return out


def build_pipeline() -> Pipeline:
    # TruncatedSVD densifies sparse char TF-IDF; raw high-dim sparse input
    # makes this small MLP collapse on a 42-class, 210-row seed set.
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
                "svd",
                TruncatedSVD(
                    n_components=SVD_COMPONENTS,
                    random_state=RANDOM_STATE,
                ),
            ),
            (
                "clf",
                MLPClassifier(
                    hidden_layer_sizes=HIDDEN_LAYERS,
                    activation="relu",
                    solver="adam",
                    alpha=1e-4,
                    learning_rate_init=1e-3,
                    max_iter=MLP_MAX_ITER,
                    early_stopping=False,
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def load_classical_summary(results_dir: Path) -> dict | None:
    path = results_dir / CLASSICAL_METRICS_NAME
    if not path.exists():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    test = payload.get("test") or {}
    return {
        "model": payload.get("model", "tfidf_char_wb_logreg"),
        "accuracy": test.get("accuracy"),
        "macroF1": test.get("macroF1"),
        "weightedF1": test.get("weightedF1"),
        "top3Accuracy": test.get("top3Accuracy"),
        "perCategory": test.get("perCategory") or {},
    }


def comparison_block(neural_test: dict, classical: dict | None) -> list[str]:
    lines = [
        "## Comparison to classical baseline",
        "",
    ]
    if classical is None:
        lines.extend(
            [
                f"Classical metrics file `{CLASSICAL_METRICS_NAME}` not found. "
                "Run `train_classical_intent.py` first for a side-by-side table.",
                "",
            ]
        )
        return lines

    lines.extend(
        [
            "Same train/test JSONL split and char_wb TF-IDF (3–5). "
            "Neural path adds TruncatedSVD before MLP.",
            "",
            "| Metric | Classical (LogReg) | Neural (MLP) | Delta (MLP − LogReg) |",
            "|---|---:|---:|---:|",
        ]
    )
    for key, label in (
        ("accuracy", "Accuracy (top-1)"),
        ("macroF1", "Macro F1"),
        ("weightedF1", "Weighted F1"),
        ("top3Accuracy", "Top-3 accuracy"),
    ):
        c_val = float(classical[key])
        n_val = float(neural_test[key])
        delta = n_val - c_val
        lines.append(
            f"| {label} | {c_val:.4f} | {n_val:.4f} | {delta:+.4f} |"
        )

    lines.extend(
        [
            "",
            "### Per-category accuracy",
            "",
            "| Category | Classical | Neural | Delta |",
            "|---|---:|---:|---:|",
        ]
    )
    cats = sorted(
        set(classical["perCategory"].keys()) | set(neural_test["perCategory"].keys())
    )
    for cat in cats:
        c_row = classical["perCategory"].get(cat) or {}
        n_row = neural_test["perCategory"].get(cat) or {}
        c_acc = float(c_row.get("accuracy", 0.0))
        n_acc = float(n_row.get("accuracy", 0.0))
        lines.append(f"| {cat} | {c_acc:.4f} | {n_acc:.4f} | {n_acc - c_acc:+.4f} |")

    lines.append("")
    return lines


def metrics_markdown(metrics: dict, classical: dict | None) -> str:
    clf = metrics["classifier"]
    lines = [
        "# Neural intent baseline (TF-IDF + MLP)",
        "",
        f"Date: {metrics['trainedOn']}",
        "",
        "## Setup",
        "",
        f"- Train rows: {metrics['trainCount']}",
        f"- Test rows: {metrics['testCount']}",
        f"- Label count (faqId): {metrics['labelCount']}",
        f"- Vectorizer: char_wb TF-IDF n-grams {metrics['vectorizer']['ngramRange']}",
        f"- Dimensionality reduction: TruncatedSVD "
        f"(n_components={metrics['svd']['nComponents']})",
        f"- Classifier: MLPClassifier "
        f"(hidden={list(clf['hiddenLayerSizes'])}, max_iter={clf['maxIter']})",
        f"- MLP epochs run: {clf.get('nIter_', 'n/a')}",
        "",
        "## Held-out test metrics",
        "",
        f"- Accuracy (top-1): **{metrics['test']['accuracy']:.4f}**",
        f"- Macro F1: **{metrics['test']['macroF1']:.4f}**",
        f"- Weighted F1: **{metrics['test']['weightedF1']:.4f}**",
        f"- Top-3 accuracy: **{metrics['test']['top3Accuracy']:.4f}**",
        "",
        "## Per-category accuracy (test)",
        "",
        "| Category | N | Accuracy |",
        "|---|---:|---:|",
    ]
    for cat, row in metrics["test"]["perCategory"].items():
        lines.append(f"| {cat} | {row['n']} | {row['accuracy']:.4f} |")

    lines.append("")
    lines.extend(comparison_block(metrics["test"], classical))

    lines.extend(
        [
            "## Limits",
            "",
            "- Small curated seed (42 intents); paraphrases are not real user logs.",
            "- MLP is a compact sklearn baseline (TF-IDF → SVD → MLP), not a transformer.",
            "- Prefer the stronger held-out model for later API wiring, with documented limits.",
            "- Retrain after FAQ edits: `python experiments/scripts/train_neural_intent.py`",
            "",
        ]
    )
    return "\n".join(lines)


def comparison_markdown(metrics: dict, classical: dict | None) -> str:
    lines = [
        "# Intent baseline comparison",
        "",
        f"Date: {metrics['trainedOn']}",
        "",
        "Classical: TF-IDF + LogisticRegression. "
        "Neural: TF-IDF + TruncatedSVD + MLPClassifier.",
        "Both use `intent_train.jsonl` / `intent_test.jsonl` (seed=42).",
        "",
    ]
    lines.extend(comparison_block(metrics["test"], classical))
    lines.extend(
        [
            "## Notes",
            "",
            "- Delta is neural minus classical (positive means MLP scored higher).",
            "- Top-3 matters for a UI that can show a short shortlist of FAQ matches.",
            "- Full reports: `classical_tfidf_logreg_metrics.md`, `neural_mlp_metrics.md`.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--results-dir", type=Path, default=DEFAULT_RESULTS_DIR)
    parser.add_argument("--artifacts-dir", type=Path, default=DEFAULT_ARTIFACTS_DIR)
    args = parser.parse_args()

    train_rows = load_jsonl(args.data_dir / "intent_train.jsonl")
    test_rows = load_jsonl(args.data_dir / "intent_test.jsonl")
    if not train_rows or not test_rows:
        raise SystemExit("Missing train/test JSONL. Run export_intent_split.py first.")

    x_train = [r["text"] for r in train_rows]
    y_train = [r["faqId"] for r in train_rows]
    x_test = [r["text"] for r in test_rows]
    y_test = [r["faqId"] for r in test_rows]
    id_to_category = {r["faqId"]: r["category"] for r in train_rows + test_rows}

    # Integer labels avoid an sklearn early-stopping score bug with string targets.
    label_encoder = LabelEncoder()
    y_train_enc = label_encoder.fit_transform(y_train)

    pipeline = build_pipeline()
    pipeline.fit(x_train, y_train_enc)

    y_pred = list(label_encoder.inverse_transform(pipeline.predict(x_test)))
    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0,
    )
    mlp = pipeline.named_steps["clf"]

    metrics = {
        "model": "tfidf_char_wb_mlp",
        "trainedOn": date.today().isoformat(),
        "trainCount": len(train_rows),
        "testCount": len(test_rows),
        "labelCount": len(set(y_train)),
        "trainLabelCounts": dict(sorted(Counter(y_train).items())),
        "vectorizer": {
            "analyzer": "char_wb",
            "ngramRange": [3, 5],
            "sublinearTf": True,
        },
        "svd": {
            "nComponents": SVD_COMPONENTS,
            "randomState": RANDOM_STATE,
        },
        "classifier": {
            "type": "MLPClassifier",
            "hiddenLayerSizes": list(HIDDEN_LAYERS),
            "activation": "relu",
            "solver": "adam",
            "alpha": 1e-4,
            "maxIter": MLP_MAX_ITER,
            "earlyStopping": False,
            "randomState": RANDOM_STATE,
            "nIter_": int(getattr(mlp, "n_iter_", 0)),
        },
        "test": {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "macroF1": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
            "weightedF1": round(
                float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
                4,
            ),
            "top3Accuracy": round(
                top_k_accuracy(pipeline, label_encoder, x_test, y_test, k=3),
                4,
            ),
            "perCategory": per_category_accuracy(y_test, y_pred, id_to_category),
            "classificationReport": report,
        },
        "files": {
            "train": "intent_train.jsonl",
            "test": "intent_test.jsonl",
            "metricsJson": "neural_mlp_metrics.json",
            "metricsMd": "neural_mlp_metrics.md",
            "comparisonMd": "intent_baseline_comparison.md",
            "artifact": "neural_mlp.joblib",
        },
    }

    classical = load_classical_summary(args.results_dir)
    if classical is not None:
        metrics["comparison"] = {
            "classicalModel": classical["model"],
            "classical": {
                "accuracy": classical["accuracy"],
                "macroF1": classical["macroF1"],
                "weightedF1": classical["weightedF1"],
                "top3Accuracy": classical["top3Accuracy"],
            },
            "delta": {
                "accuracy": round(
                    metrics["test"]["accuracy"] - float(classical["accuracy"]), 4
                ),
                "macroF1": round(
                    metrics["test"]["macroF1"] - float(classical["macroF1"]), 4
                ),
                "weightedF1": round(
                    metrics["test"]["weightedF1"] - float(classical["weightedF1"]), 4
                ),
                "top3Accuracy": round(
                    metrics["test"]["top3Accuracy"] - float(classical["top3Accuracy"]),
                    4,
                ),
            },
        }

    args.results_dir.mkdir(parents=True, exist_ok=True)
    args.artifacts_dir.mkdir(parents=True, exist_ok=True)

    json_path = args.results_dir / "neural_mlp_metrics.json"
    md_path = args.results_dir / "neural_mlp_metrics.md"
    cmp_path = args.results_dir / "intent_baseline_comparison.md"
    artifact_path = args.artifacts_dir / "neural_mlp.joblib"

    json_path.write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    md_path.write_text(metrics_markdown(metrics, classical), encoding="utf-8")
    cmp_path.write_text(comparison_markdown(metrics, classical), encoding="utf-8")
    joblib.dump(
        {
            "pipeline": pipeline,
            "labelEncoder": label_encoder,
            "labelCount": metrics["labelCount"],
            "model": metrics["model"],
        },
        artifact_path,
    )

    print(
        f"test accuracy={metrics['test']['accuracy']:.4f} "
        f"macroF1={metrics['test']['macroF1']:.4f} "
        f"top3={metrics['test']['top3Accuracy']:.4f}"
    )
    if classical is not None:
        print(
            "vs classical: "
            f"acc {metrics['comparison']['delta']['accuracy']:+.4f}, "
            f"macroF1 {metrics['comparison']['delta']['macroF1']:+.4f}, "
            f"top3 {metrics['comparison']['delta']['top3Accuracy']:+.4f}"
        )
    print(f"Wrote {json_path}")
    print(f"Wrote {md_path}")
    print(f"Wrote {cmp_path}")
    print(f"Wrote {artifact_path} (local artifact)")


if __name__ == "__main__":
    main()
