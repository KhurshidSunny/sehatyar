# Intent baseline comparison

Date: 2026-10-23

Classical: TF-IDF + LogisticRegression. Neural: TF-IDF + TruncatedSVD + MLPClassifier.
Both use `intent_train.jsonl` / `intent_test.jsonl` (seed=42).

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

## Notes

- Delta is neural minus classical (positive means MLP scored higher).
- Top-3 matters for a UI that can show a short shortlist of FAQ matches.
- Full reports: `classical_tfidf_logreg_metrics.md`, `neural_mlp_metrics.md`.
