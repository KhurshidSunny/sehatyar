# SehatYar

**Pashto health literacy assistant** — an offline-capable progressive web app for low-connectivity users in Afghanistan.

SehatYar helps people:
1. Browse **curated health FAQs** in simple Pashto (text + audio)
2. **Identify a household medicine** from a pack photo (OCR → curated catalog → uses and warnings in Pashto)

It does **not** diagnose disease or prescribe medicine. It is information support only. Users should see a doctor or pharmacist when needed.

## Why this exists

Many users face low literacy, weak internet, and medicine packs they cannot read. SehatYar is designed for large tap targets, short answers, audio playback, and offline caching of top content.

## Status

Monorepo layout, FastAPI health check, Next.js web scaffolding, and draft FAQ seed data (42 Pashto FAQs across 6 categories) are in place. The medicine catalog and wired screens are not built yet.

## Stack

| Layer | Technology |
|---|---|
| Web (PWA) | Next.js, TypeScript, Tailwind CSS |
| API | Python FastAPI |
| Database | MongoDB Atlas |
| OCR | Tesseract |
| NLP experiments | scikit-learn (+ small neural baseline) |
| Hosting | Netlify/Vercel (web) + Render/Railway (API) |

## Repository layout

```
sehatyar/
  README.md
  LICENSE
  .gitignore
  docs/
    PROJECT_PLAN.md
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
- [Web app](apps/web/README.md)
- [API](apps/api/README.md)
- [Content data](data/README.md)
- [Experiments](experiments/README.md)

## Safety

- No automated prescribing  
- No uncontrolled live web medical answers  
- Danger signs point users to clinic care  
- Content is curated and dated  

## Author

Khurshid Khan Ahmadzai  

## License

MIT — see [LICENSE](LICENSE).
