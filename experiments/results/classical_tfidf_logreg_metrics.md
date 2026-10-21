# Classical intent baseline (TF-IDF + LogisticRegression)

Date: 2026-10-21

## Setup

- Train rows: 210
- Test rows: 84
- Label count (faqId): 42
- Vectorizer: char_wb TF-IDF n-grams [3, 5]
- Classifier: LogisticRegression (C=2.0)

## Held-out test metrics

- Accuracy (top-1): **0.5952**
- Macro F1: **0.5944**
- Weighted F1: **0.5944**
- Top-3 accuracy: **0.8571**

## Per-category accuracy (test)

| Category | N | Accuracy |
|---|---:|---:|
| child-care | 14 | 0.5714 |
| diarrhea-ors | 14 | 0.4286 |
| fever | 14 | 0.4286 |
| pregnancy | 14 | 0.7857 |
| vaccines | 14 | 0.8571 |
| when-to-visit-clinic | 14 | 0.5000 |

## Limits

- Labels are FAQ ids from a small curated seed (42 intents).
- Test utterances are paraphrases of the same FAQs, not real user logs.
- High accuracy here does not mean the live app is ready for clinical use.
- Retrain after FAQ edits: `python experiments/scripts/train_classical_intent.py`
