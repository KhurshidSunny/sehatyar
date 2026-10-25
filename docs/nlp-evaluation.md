# FAQ intent classification — methods, metrics, and limits

Offline evaluation of how well typed (or paraphrased) Pashto questions map to curated FAQ ids. This work supports ranking answers for search / chat-style entry; it does **not** diagnose illness or choose medicines.

Related safety rules: [CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md). Experiment scripts and raw metrics: [experiments/README.md](../experiments/README.md).

## 1. Task

| Item | Definition |
|---|---|
| Input | Short text utterance (Pashto FAQ question or paraphrase) |
| Label | Curated `faqId` (42 intents across 6 categories) |
| Goal | Rank the correct FAQ highly so a UI can show one answer or a short shortlist |

Categories: `child-care`, `diarrhea-ors`, `fever`, `pregnancy`, `vaccines`, `when-to-visit-clinic`.

## 2. Dataset and split

Each FAQ contributes its canonical `questionPs` plus six `paraphrasesPs` (seven utterances). A fixed split (`seed=42`) holds out **two paraphrases per FAQ** for test; the canonical question stays in train when possible.

| Split | Rows | File |
|---|---:|---|
| Train | 210 | `experiments/data/intent_train.jsonl` |
| Test | 84 | `experiments/data/intent_test.jsonl` |
| Meta | — | `experiments/data/intent_split_meta.json` |

Rebuild after FAQ edits:

```bash
python experiments/scripts/export_intent_split.py
```

## 3. Methods

Both baselines use character n-gram TF-IDF (`analyzer=char_wb`, n-grams 3–5, `sublinear_tf=True`) so short Pashto strings are comparable without a large word vocabulary.

### Classical — TF-IDF + LogisticRegression

- Classifier: `LogisticRegression` (`C=2.0`, `max_iter=2000`, `lbfgs`)
- Script: `experiments/scripts/train_classical_intent.py`
- Artifact (local, gitignored): `experiments/artifacts/classical_tfidf_logreg.joblib`

### Neural — TF-IDF + TruncatedSVD + MLP

- Reduction: `TruncatedSVD` (`n_components=128`) — densifies sparse char TF-IDF before the MLP
- Classifier: `MLPClassifier` hidden layers `(128, 64)`, `max_iter=500`, fixed `random_state=42`
- Script: `experiments/scripts/train_neural_intent.py`
- Artifact (local, gitignored): `experiments/artifacts/neural_mlp.joblib`

Retrain:

```bash
python experiments/scripts/train_classical_intent.py
python experiments/scripts/train_neural_intent.py
```

## 4. Metrics (held-out test)

Numbers below match the committed result notes under `experiments/results/` (classical trained 2026-10-21; neural 2026-10-23). Re-running the scripts may change values slightly if dependencies or data change.

| Metric | Classical (LogReg) | Neural (MLP) |
|---|---:|---:|
| Accuracy (top-1) | 0.5952 | **0.7262** |
| Macro F1 | 0.5944 | **0.7008** |
| Weighted F1 | 0.5944 | **0.7008** |
| Top-3 accuracy | 0.8571 | 0.8571 |

Per-category top-1 accuracy (14 test rows each):

| Category | Classical | Neural |
|---|---:|---:|
| child-care | 0.5714 | 0.6429 |
| diarrhea-ors | 0.4286 | 0.6429 |
| fever | 0.4286 | 0.7857 |
| pregnancy | 0.7857 | 0.7857 |
| vaccines | 0.8571 | 0.7857 |
| when-to-visit-clinic | 0.5000 | 0.7143 |

Full tables and classification reports:

- `experiments/results/classical_tfidf_logreg_metrics.md` (+ `.json`)
- `experiments/results/neural_mlp_metrics.md` (+ `.json`)
- `experiments/results/intent_baseline_comparison.md`

**Reading tip:** Top-3 ≈ 0.86 means a shortlist of three FAQs often contains the right id even when top-1 is wrong — useful for a “did you mean…?” UI.

## 5. Live API

`POST /predict-intent` with body `{"text":"..."}` (optional `?top_k=`) returns a top FAQ id, category, score, and ranked candidates.

Default behaviour in `apps/api/services/intent.py`:

1. If `INTENT_MODEL_PATH` points to a readable `.joblib`, load it.
2. Else if `experiments/artifacts/classical_tfidf_logreg.joblib` exists, load that.
3. Else train the classical TF-IDF + LogReg recipe from current FAQ seed questions and paraphrases at startup.

The API path prefers the classical recipe for a simple, dependency-light default. Offline, the neural baseline scored higher top-1 on this paraphrase split; swapping the live model is an ops choice via `INTENT_MODEL_PATH`, not a claim that either model is clinically validated.

## 6. Limits (read before citing numbers)

1. **Small curated seed** — 42 FAQ intents, not an open medical ontology.
2. **Paraphrase test, not real users** — held-out lines are rewritten questions for the same FAQs, not field logs from clinics or homes.
3. **Pashto / mixed text** — char n-grams help, but dialect, typos, and code-switching are under-tested.
4. **Not clinical decision support** — ranking a FAQ is not diagnosis, triage, or prescribing. Wrong matches must fail soft (shortlist, browse categories, disclaimer).
5. **Sklearn baselines only** — no transformer LM; MLP here is a small dense net on SVD features.
6. **Drift after content edits** — adding or rewriting FAQs changes labels; re-export the split and retrain before comparing to these numbers.
7. **API default ≠ best offline score** — classical is the documented default warm path; neural may be plugged in via artifact path after local training.

## 7. What “good enough” means for v1

For demos and product evaluation:

- Show the split sizes and the comparison table honestly.
- Prefer demos that combine browse + intent ranking, not intent alone.
- If top-1 is wrong, show top-3 and let the user pick.
- Keep the product disclaimer visible; never present a matched FAQ as a diagnosis.
