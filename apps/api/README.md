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
```

| File | Purpose |
|---|---|
| `requirements.txt` | Python dependencies |
| `.env.example` | Env var template (copy to `.env`; do not commit secrets) |
| `.env` | Local secrets only (gitignored) |
| `main.py` | FastAPI app + `/health` |
| `db.py` | Motor MongoDB client |
| `config.py` | Settings from env |

## Endpoints (planned surface)

| Area | Purpose |
|---|---|
| Health | Service check |
| FAQs | Categories, lists, and answer payloads |
| Medicines | Name search and OCR-assisted match |
| Feedback | Helpfulness votes on answers |

## Notes

- Content comes from curated data under `/data`, not open-web medical scraping.
- Responses must stay informational: uses and warnings only, no prescribing.
