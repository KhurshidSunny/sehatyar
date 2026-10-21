# Experiments

Offline evaluation scripts and datasets for FAQ intent matching and related checks.

This folder is separate from the live API. It is used to compare methods, record metrics, and keep evaluation reproducible.

## Layout

```
experiments/
  README.md
  requirements.txt
  data/
    intent_train.jsonl      # train utterances (question + paraphrases)
    intent_test.jsonl       # held-out utterances (fixed seed)
    intent_split_meta.json  # counts, seed, and file names
  scripts/
    export_intent_split.py      # rebuild train/test from data/faqs
    train_classical_intent.py   # TF-IDF + LogisticRegression baseline
  results/
    classical_tfidf_logreg_metrics.json
    classical_tfidf_logreg_metrics.md
  artifacts/                # local .joblib models (gitignored)
```

## Setup

```bash
pip install -r experiments/requirements.txt
```

## Intent split

Each FAQ contributes its canonical `questionPs` plus `paraphrasesPs` as labeled examples (`faqId`, `category`, `source`).

Rebuild after FAQ edits:

```bash
python experiments/scripts/export_intent_split.py
```

Current seed data: 42 FAQs, each with the canonical `questionPs` plus 6 `paraphrasesPs` (7 utterances). With `seed=42`, two paraphrases per FAQ are held out for test → 210 train and 84 test rows.

## Classical baseline (TF-IDF + LogisticRegression)

Character n-gram TF-IDF (`char_wb`, 3–5) with multinomial LogisticRegression, trained on the fixed split above.

```bash
python experiments/scripts/train_classical_intent.py
```

Writes:

- `results/classical_tfidf_logreg_metrics.json` — full metrics
- `results/classical_tfidf_logreg_metrics.md` — short readable summary
- `artifacts/classical_tfidf_logreg.joblib` — fitted pipeline (local only; not committed)

Latest held-out numbers are in the metrics files (accuracy, macro/weighted F1, top-3 accuracy, per-category accuracy).

## Expected next work

- A small neural baseline (for example sklearn MLP) on the same split
- Intent prediction API wiring using a chosen model
- Short technical note on methods, metrics, and limits

## Notes

- Prefer small, honest demos over overstated accuracy claims.
- Keep generated model artifacts out of git unless intentionally versioned.
- High paraphrase-split accuracy does not mean the live app is ready for clinical use.
