"""Train a TF-IDF + LogisticRegression FAQ intent baseline on the fixed split.

Run from repo root:

  python experiments/scripts/train_classical_intent.py

Reads experiments/data/intent_{train,test}.jsonl and writes metrics under
experiments/results/. The fitted pipeline is saved as a local .joblib artifact
(gitignored) for later API wiring.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.pipeline import Pipeline
import joblib

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_DIR = REPO_ROOT / "experiments" / "data"
DEFAULT_RESULTS_DIR = REPO_ROOT / "experiments" / "results"
DEFAULT_ARTIFACTS_DIR = REPO_ROOT / "experiments" / "artifacts"


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def top_k_accuracy(clf: Pipeline, texts: list[str], y_true: list[str], k: int) -> float:
    if k <= 1:
        preds = clf.predict(texts)
        return float(accuracy_score(y_true, preds))

    classes = list(clf.named_steps["clf"].classes_)
    proba = clf.predict_proba(texts)
    hits = 0
    for i, true_label in enumerate(y_true):
        ranked = sorted(
            range(len(classes)),
            key=lambda j: proba[i][j],
            reverse=True,
        )[:k]
        if true_label in {classes[j] for j in ranked}:
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
    # Character n-grams suit short Pashto paraphrases better than sparse word unigrams alone.
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


def metrics_markdown(metrics: dict) -> str:
    lines = [
        "# Classical intent baseline (TF-IDF + LogisticRegression)",
        "",
        f"Date: {metrics['trainedOn']}",
        "",
        "## Setup",
        "",
        f"- Train rows: {metrics['trainCount']}",
        f"- Test rows: {metrics['testCount']}",
        f"- Label count (faqId): {metrics['labelCount']}",
        f"- Vectorizer: char_wb TF-IDF n-grams {metrics['vectorizer']['ngramRange']}",
        f"- Classifier: LogisticRegression (C={metrics['classifier']['C']})",
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

    lines.extend(
        [
            "",
            "## Limits",
            "",
            "- Labels are FAQ ids from a small curated seed (42 intents).",
            "- Test utterances are paraphrases of the same FAQs, not real user logs.",
            "- High accuracy here does not mean the live app is ready for clinical use.",
            "- Retrain after FAQ edits: `python experiments/scripts/train_classical_intent.py`",
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

    pipeline = build_pipeline()
    pipeline.fit(x_train, y_train)

    y_pred = list(pipeline.predict(x_test))
    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0,
    )

    metrics = {
        "model": "tfidf_char_wb_logreg",
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
        "classifier": {
            "type": "LogisticRegression",
            "C": 2.0,
            "maxIter": 2000,
        },
        "test": {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "macroF1": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
            "weightedF1": round(
                float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
                4,
            ),
            "top3Accuracy": round(top_k_accuracy(pipeline, x_test, y_test, k=3), 4),
            "perCategory": per_category_accuracy(y_test, y_pred, id_to_category),
            "classificationReport": report,
        },
        "files": {
            "train": "intent_train.jsonl",
            "test": "intent_test.jsonl",
            "metricsJson": "classical_tfidf_logreg_metrics.json",
            "metricsMd": "classical_tfidf_logreg_metrics.md",
            "artifact": "classical_tfidf_logreg.joblib",
        },
    }

    args.results_dir.mkdir(parents=True, exist_ok=True)
    args.artifacts_dir.mkdir(parents=True, exist_ok=True)

    json_path = args.results_dir / "classical_tfidf_logreg_metrics.json"
    md_path = args.results_dir / "classical_tfidf_logreg_metrics.md"
    artifact_path = args.artifacts_dir / "classical_tfidf_logreg.joblib"

    json_path.write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    md_path.write_text(metrics_markdown(metrics), encoding="utf-8")
    joblib.dump(
        {
            "pipeline": pipeline,
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
    print(f"Wrote {json_path}")
    print(f"Wrote {md_path}")
    print(f"Wrote {artifact_path} (local artifact)")


if __name__ == "__main__":
    main()
