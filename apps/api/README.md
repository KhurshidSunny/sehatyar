# SehatYar API

Backend service for FAQ content, medicine search, OCR matching, and feedback.

## Stack

- Python
- FastAPI
- MongoDB

## Local development

```bash
cd apps/api
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
# edit .env — put your Atlas URI in MONGO_URI (never commit .env)

uvicorn main:app --reload --host 0.0.0.0 --port 8000
# then open http://127.0.0.1:8000/health  (mongo.connected should be true)
# FAQ routes: /categories , /faqs?category=fever , /faqs/fever-01
# Feedback: POST /feedback  {"targetType":"faq","targetId":"fever-01","helpful":true}
# Medicine OCR: POST /medicines/ocr  (multipart field "image")
# Requires Tesseract OCR on PATH, or set TESSERACT_CMD in .env
```

| File | Purpose |
|---|---|
| `requirements.txt` | Python dependencies |
| `.env.example` | Env var template (copy to `.env`; do not commit secrets) |
| `.env` | Local secrets only (gitignored) |
| `main.py` | FastAPI app + `/health` |
| `db.py` | Motor MongoDB client |
| `config.py` | Settings from env |
| `routers/` | HTTP route modules |
| `services/` | Content loaders, lookups, and feedback persistence |
| `schemas/` | Pydantic models for FAQ, medicine, and feedback |
| `scripts/seed.py` | Loads curated JSON from `/data` into MongoDB |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service + MongoDB check |
| GET | `/categories` | FAQ categories in display order |
| GET | `/faqs` | FAQ summaries (`?category=` optional filter) |
| GET | `/faqs/{id}` | Full FAQ answer payload |
| GET | `/medicines/search?q=` | Fuzzy medicine name search (optional `limit`) |
| POST | `/medicines/ocr` | Multipart pack photo → OCR text + ranked catalog matches |
| POST | `/feedback` | Store anonymous helpfulness vote (`targetType`, `targetId`, `helpful`) |

FAQ and medicine reads come from curated JSON (`FAQ_DATA_DIR`, `MEDICINE_DATA_DIR`). Feedback votes are written to the MongoDB `feedback` collection.

## Seeding MongoDB

`scripts/seed.py` validates every file under `/data` with the same Pydantic models the API uses, then upserts the content into MongoDB keyed by each entry's `id`. Run it from `apps/api` with `.env` pointing at the target database:

```bash
python -m scripts.seed            # insert or update all content
python -m scripts.seed --dry-run  # validate JSON and print counts, no writes
python -m scripts.seed --prune    # also remove documents whose id left the JSON
```

| Collection | Source | Indexes |
|---|---|---|
| `faq_categories` | `data/faqs/categories.json` | `order` |
| `faqs` | other `data/faqs/*.json` | `category` |
| `medicine_categories` | `data/medicines/categories.json` | `order` |
| `medicines` | other `data/medicines/*.json` | `category`, `names` |

Re-running is safe: unchanged entries are left as they are, edited entries are replaced. `lastReviewed` is stored as an ISO date string. The `feedback` collection is never touched.

## Schemas

Pydantic models under `schemas/` match the curated JSON under `/data` and the API payloads:

| Module | Models |
|---|---|
| `schemas/faq.py` | `FaqCategory`, `Faq`, `FaqSummary` |
| `schemas/medicine.py` | `MedicineCategory`, `Medicine`, `MedicineSummary`, OCR response models |
| `schemas/feedback.py` | `FeedbackCreate`, `FeedbackRecord` |

`dangerLevel` is one of `info` / `clinic` / `emergency`. `reviewStatus` is `draft` or `reviewed`. Feedback stores only `targetType`, `targetId`, and `helpful` (no personal identity).

Matching TypeScript types live in `apps/web/lib/types/`.

## Deploy (Render + GitHub Actions)

Live API: configure Root Directory `apps/api`, start with  
`uvicorn main:app --host 0.0.0.0 --port $PORT`, health check `/health`.

### One-time setup

1. **Render → your web service → Settings → Deploy Hook**  
   Create a hook and copy the URL (looks like `https://api.render.com/deploy/srv-...?...`).
2. **GitHub → repo Settings → Secrets and variables → Actions**  
   New secret name: `RENDER_DEPLOY_HOOK`  
   Value: paste that Deploy Hook URL (never commit it).
3. **Render → Settings → Auto-Deploy**  
   Set to **Off** (or “Disable Auto-Deploy”) so only GitHub Actions triggers deploys.  
   If Auto-Deploy stays On, every push can cause **two** deploys.

### What happens after that

Push to `main` that changes `apps/api/**` or `data/**` runs  
`.github/workflows/deploy-api-render.yml`, which POSTs the deploy hook.  
You can also run the workflow manually: GitHub → Actions → **Deploy API to Render** → **Run workflow**.

Frontend on Vercel keeps using its own Git integration; this workflow is API-only.

## Notes

- Content comes from curated data under `/data`, not open-web medical scraping.
- Responses must stay informational: uses and warnings only, no prescribing.
