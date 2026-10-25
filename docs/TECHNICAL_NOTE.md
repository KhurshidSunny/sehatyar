# SehatYar — technical note

Short summary of the problem SehatYar addresses, how the system is built, what was measured, and where it still falls short. For deeper FAQ-matching detail see [nlp-evaluation.md](nlp-evaluation.md). For content rules see [CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md).

## 1. Problem

In many Afghan households, people keep common medicines (fever tablets, ORS, antibiotics, syrups) but cannot always read the pack. Health advice on phones is often in English or Urdu, text-heavy, or needs a stable connection. Literacy is uneven, so text-only tools leave many users behind.

Unsafe “solutions” (open-web chatbots that diagnose and prescribe) are not acceptable. SehatYar takes a narrower path:

1. **Curated health FAQs** in simple Pashto, with optional audio, large tap targets, and offline caching of the top pack.
2. **Medicine pack identification** via photo OCR or typed name against a fixed catalog, then uses and warnings in Pashto — never a dose or a symptom→drug prescription.

The product is **information support**. It does not replace a doctor, midwife, or pharmacist.

## 2. Users and design choices

| Constraint | Design response |
|---|---|
| Limited reading ability | Short answers, audio playback, large buttons, Pashto-first UI (English toggle for helpers) |
| Weak or expensive connectivity | PWA + service worker; cache top FAQs and audio after first visit |
| Unreadable medicine packs | Camera / upload → OCR → fuzzy catalog match; typed-name fallback |
| Harm from automated prescribing | Curated content only; explicit disclaimer; danger signs point to clinic care |

Target users include adults with limited literacy, family members helping relatives, and anyone who needs basic Pashto health explanations when the network is poor.

## 3. System overview

```
apps/web (Next.js PWA)  →  apps/api (FastAPI)  →  curated JSON (+ MongoDB for feedback)
                              ↓
                    Tesseract OCR · FAQ intent · fuzzy medicine match
experiments/          offline train/test for FAQ intent baselines
data/faqs · data/medicines   curated seed content
```

| Piece | Role |
|---|---|
| Web PWA | FAQ browse, medicine photo/search, offline indicators, bilingual UI |
| FastAPI | Categories, FAQs, medicine search/OCR, `POST /predict-intent`, feedback |
| Content seed | Versioned JSON under `data/` — reviewable, dated, not live web scrape |
| Experiments | Paraphrase split + classical / neural intent metrics |

## 4. Methods

### Content

- Fixed FAQ categories (fever, ORS/diarrhea, vaccines, pregnancy, child care, when to visit a clinic).
- Medicine catalog with names, uses, and warnings in Pashto (and English fields for helpers).
- Review metadata (`lastReviewed`, `reviewStatus`, sources) on entries.

### Medicine identification

- OCR on pack photos (Tesseract).
- Fuzzy string match to catalog names.
- If OCR is weak or empty: typed search via `GET /medicines/search`.

### FAQ intent (typed matching)

- Labels = curated `faqId` values (42 intents).
- Train/test from canonical questions + paraphrases (`seed=42` → 210 train / 84 test).
- Classical: char n-gram TF-IDF + LogisticRegression.
- Neural: same TF-IDF → TruncatedSVD → small MLP.
- Live API: `POST /predict-intent`; default warm path trains or loads the classical recipe (optional `.joblib` via `INTENT_MODEL_PATH`).

Intent ranking is for finding the right curated answer, not for clinical triage.

## 5. Metrics (FAQ intent, held-out paraphrases)

| Metric | Classical | Neural |
|---|---:|---:|
| Top-1 accuracy | 0.5952 | 0.7262 |
| Macro F1 | 0.5944 | 0.7008 |
| Top-3 accuracy | 0.8571 | 0.8571 |

Full tables and scripts: [nlp-evaluation.md](nlp-evaluation.md) and `experiments/results/`.

OCR quality depends on lighting, blur, and pack language; the typed fallback exists because photo matching will fail in the field. Treat OCR as assistive, not perfect.

## 6. Limits

1. **Curated scope** — small FAQ and medicine sets; not the whole of medicine.
2. **Paraphrase evaluation** — intent numbers use rewritten questions, not yet real household query logs.
3. **Pashto ASR/TTS** — v1 uses pre-recorded or linked audio where available; live speech recognition is out of scope.
4. **OCR** — fails on blurry, angled, or low-contrast packs; English/Latin packaging is easier than dense mixed scripts.
5. **No diagnosis or dosing** — by policy ([CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md)).
6. **Connectivity** — offline covers the cached top FAQ pack, not the entire catalog or every OCR call.
7. **Baselines only** — sklearn models, not large language models generating medical text.

## 7. What success looks like for v1

- A new user can open a FAQ answer (with audio when present) in under a minute.
- At least one clear pack photo path reaches a catalog match and Pashto uses/warnings.
- Top FAQs still open after a first visit when the network drops.
- Disclaimer stays visible; the app never invents a prescription.
- Intent and OCR limits can be stated with numbers and honest caveats.

## 8. Live demo

**https://sehatyar-iota.vercel.app**

## 9. Repository pointers

| Path | What |
|---|---|
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | Scope and phases |
| [CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md) | Allowed / forbidden content |
| [nlp-evaluation.md](nlp-evaluation.md) | Intent methods and metrics |
| [FOR_REVIEWERS.md](FOR_REVIEWERS.md) | Demo walkthrough |
| `data/faqs/`, `data/medicines/` | Seed content |
| `experiments/` | Train/test scripts and result notes |
| `apps/web`, `apps/api` | Product code |
