# SehatYar

**Pashto health literacy assistant** — an offline-capable progressive web app for low-connectivity users in Afghanistan.

SehatYar helps people:
1. Browse **curated health FAQs** in simple Pashto (text + audio)
2. **Identify a household medicine** from a pack photo (OCR → curated catalog → uses and warnings in Pashto)

It does **not** diagnose disease or prescribe medicine. It is information support only. Users should see a doctor or pharmacist when needed.

## Why this exists

Many users face low literacy, weak internet, and medicine packs they cannot read. SehatYar is designed for large tap targets, short answers, audio playback, and offline caching of top content.

## Status

FAQ browse, bilingual UI, FastAPI content APIs, helpfulness feedback, medicine pack photo capture, OCR (`POST /medicines/ocr`), catalog fuzzy matching, result detail screen, typed-name fallback (`GET /medicines/search`), PWA install basics, offline caching of the top FAQ pack, offline / saved-content UI indicators, and a FAQ paraphrase train/test split under `experiments/data/` are in place.

## Stack

| Layer | Technology |
|---|---|
| Web (PWA) | Next.js, TypeScript, Tailwind CSS |
| API | Python FastAPI |
| Database | MongoDB Atlas |
| OCR | Tesseract |
| NLP experiments | scikit-learn (+ small neural baseline) |
| Hosting | Vercel (web) + Render (API); API deploys via GitHub Actions deploy hook |

## Repository layout

```
sehatyar/
  README.md
  LICENSE
  .gitignore
  docs/
    PROJECT_PLAN.md
    CONTENT_AND_SAFETY.md
  apps/
    web/          # PWA frontend
    api/          # FastAPI backend
  data/
    faqs/         # curated FAQ seed data
    medicines/    # curated medicine catalog
  experiments/    # offline NLP / evaluation work
```

## Documentation

- [Project plan](docs/PROJECT_PLAN.md) — scope, features, stack, safety rules
- [Content and safety](docs/CONTENT_AND_SAFETY.md) — allowed / forbidden content and review process
- [Web app](apps/web/README.md)
- [API](apps/api/README.md)
- [Content data](data/README.md)
- [Experiments](experiments/README.md)

## Safety

Full policy: [CONTENT_AND_SAFETY.md](docs/CONTENT_AND_SAFETY.md).

- No automated prescribing  
- No uncontrolled live web medical answers  
- Danger signs point users to clinic care  
- Content is curated, dated, and reviewable  


## Author

Khurshid Khan Ahmadzai  

## License

MIT — see [LICENSE](LICENSE).
