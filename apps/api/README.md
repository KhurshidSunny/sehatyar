# SehatYar API

Backend service for FAQ content, medicine search, OCR matching, and feedback.

## Stack

- Python
- FastAPI
- MongoDB

## Local development

Dependency list and environment examples will live in this folder. Typical run shape:

```bash
# from apps/api (after dependencies are installed)
uvicorn main:app --reload --port 8000
```

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
