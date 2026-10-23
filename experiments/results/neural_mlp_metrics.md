# Neural intent baseline (TF-IDF + MLP)

Date: 2026-10-23

## Setup

- Train rows: 210
- Test rows: 84
- Label count (faqId): 42
- Vectorizer: char_wb TF-IDF n-grams [3, 5]
- Dimensionality reduction: TruncatedSVD (n_components=128)
- Classifier: MLPClassifier (hidden=[128, 64], max_iter=500)
- MLP epochs run: 396

## Held-out test metrics

- Accuracy (top-1): **0.7262**
- Macro F1: **0.7008**
- Weighted F1: **0.7008**
- Top-3 accuracy: **0.8571**

## Per-category accuracy (test)

| Category | N | Accuracy |
|---|---:|---:|
| child-care | 14 | 0.6429 |
| diarrhea-ors | 14 | 0.6429 |
| fever | 14 | 0.7857 |
| pregnancy | 14 | 0.7857 |
| vaccines | 14 | 0.7857 |
| when-to-visit-clinic | 14 | 0.7143 |

## Comparison to classical baseline

Same train/test JSONL split and char_wb TF-IDF (3–5). Neural path adds TruncatedSVD before MLP.

| Metric | Classical (LogReg) | Neural (MLP) | Delta (MLP − LogReg) |
|---|---:|---:|---:|
| Accuracy (top-1) | 0.5952 | 0.7262 | +0.1310 |
| Macro F1 | 0.5944 | 0.7008 | +0.1064 |
| Weighted F1 | 0.5944 | 0.7008 | +0.1064 |
| Top-3 accuracy | 0.8571 | 0.8571 | +0.0000 |

### Per-category accuracy

| Category | Classical | Neural | Delta |
|---|---:|---:|---:|
| child-care | 0.5714 | 0.6429 | +0.0715 |
| diarrhea-ors | 0.4286 | 0.6429 | +0.2143 |
| fever | 0.4286 | 0.7857 | +0.3571 |
| pregnancy | 0.7857 | 0.7857 | +0.0000 |
| vaccines | 0.8571 | 0.7857 | -0.0714 |
| when-to-visit-clinic | 0.5000 | 0.7143 | +0.2143 |

## Limits

- Small curated seed (42 intents); paraphrases are not real user logs.
- MLP is a compact sklearn baseline (TF-IDF → SVD → MLP), not a transformer.
- Prefer the stronger held-out model for later API wiring, with documented limits.
- Retrain after FAQ edits: `python experiments/scripts/train_neural_intent.py`
