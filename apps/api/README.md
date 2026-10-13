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
| `services/` | Content loaders and lookups |
| `schemas/` | Pydantic models for FAQ, medicine, and feedback |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service + MongoDB check |
| GET | `/categories` | FAQ categories in display order |
| GET | `/faqs` | FAQ summaries (`?category=` optional filter) |
| GET | `/faqs/{id}` | Full FAQ answer payload |

Planned next: medicine name search, OCR match, and feedback votes.

FAQ reads come from curated JSON under `FAQ_DATA_DIR` (default `../../data/faqs`). MongoDB is used for health checks now; seeding FAQ documents into Atlas is a later step.

## Schemas

Pydantic models under `schemas/` match the curated JSON under `/data` and the planned API payloads:

| Module | Models |
|---|---|
| `schemas/faq.py` | `FaqCategory`, `Faq`, `FaqSummary` |
| `schemas/medicine.py` | `MedicineCategory`, `Medicine`, `MedicineSummary` |
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
