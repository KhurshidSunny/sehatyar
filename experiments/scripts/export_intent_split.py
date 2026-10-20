"""Build train/test intent examples from FAQ questions and paraphrasesPs.

Run from repo root or apps/api-style paths:

  python experiments/scripts/export_intent_split.py

Writes JSONL under experiments/data/ with a fixed seed so splits stay stable.
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FAQ_DIR = REPO_ROOT / "data" / "faqs"
DEFAULT_OUT_DIR = REPO_ROOT / "experiments" / "data"
SEED = 42
# Per FAQ: keep at least this many utterances in the test split when possible.
TEST_PER_FAQ = 2


def load_faqs(faq_dir: Path) -> list[dict]:
    faqs: list[dict] = []
    for path in sorted(faq_dir.glob("*.json")):
        if path.name == "categories.json":
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, list):
            raise ValueError(f"Expected array in {path}")
        faqs.extend(payload)
    return faqs


def utterances_for_faq(faq: dict) -> list[dict]:
    texts: list[str] = []
    question = (faq.get("questionPs") or "").strip()
    if question:
        texts.append(question)
    for para in faq.get("paraphrasesPs") or []:
        para = (para or "").strip()
        if para and para not in texts:
            texts.append(para)

    rows = []
    for i, text in enumerate(texts):
        rows.append(
            {
                "text": text,
                "faqId": faq["id"],
                "category": faq["category"],
                "source": "canonical" if i == 0 else "paraphrase",
            }
        )
    return rows


def split_faq_rows(rows: list[dict], rng: random.Random) -> tuple[list[dict], list[dict]]:
    if not rows:
        return [], []
    if len(rows) == 1:
        return rows, []

    paraphrases = [r for r in rows if r["source"] == "paraphrase"]
    canonical = [r for r in rows if r["source"] == "canonical"]
    rng.shuffle(paraphrases)

    # Hold out paraphrases first so the canonical question stays in train when possible.
    n_test = min(TEST_PER_FAQ, len(paraphrases))
    if n_test == 0:
        n_test = 1 if len(rows) > 1 else 0

    test = paraphrases[:n_test]
    remaining_paraphrases = paraphrases[n_test:]
    while len(test) < n_test and canonical:
        test.append(canonical.pop())

    train = canonical + remaining_paraphrases
    if not train and test:
        train.append(test.pop())
    rng.shuffle(train)
    return train, test


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--faq-dir", type=Path, default=DEFAULT_FAQ_DIR)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()

    faqs = load_faqs(args.faq_dir)
    rng = random.Random(args.seed)

    train_rows: list[dict] = []
    test_rows: list[dict] = []
    for faq in faqs:
        rows = utterances_for_faq(faq)
        train, test = split_faq_rows(rows, rng)
        train_rows.extend(train)
        test_rows.extend(test)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    train_path = args.out_dir / "intent_train.jsonl"
    test_path = args.out_dir / "intent_test.jsonl"
    meta_path = args.out_dir / "intent_split_meta.json"

    def write_jsonl(path: Path, rows: list[dict]) -> None:
        with path.open("w", encoding="utf-8") as handle:
            for row in rows:
                handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    write_jsonl(train_path, train_rows)
    write_jsonl(test_path, test_rows)

    paraphrase_counts = [len(faq.get("paraphrasesPs") or []) for faq in faqs]
    meta = {
        "seed": args.seed,
        "testPerFaq": TEST_PER_FAQ,
        "faqCount": len(faqs),
        "trainCount": len(train_rows),
        "testCount": len(test_rows),
        "paraphrasesPerFaqMin": min(paraphrase_counts) if paraphrase_counts else 0,
        "paraphrasesPerFaqMax": max(paraphrase_counts) if paraphrase_counts else 0,
        "faqDir": "data/faqs",
        "files": {
            "train": train_path.name,
            "test": test_path.name,
        },
    }
    meta_path.write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(
        f"Wrote {len(train_rows)} train and {len(test_rows)} test examples "
        f"from {len(faqs)} FAQs → {args.out_dir}"
    )


if __name__ == "__main__":
    main()
