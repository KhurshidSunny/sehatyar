# SehatYar

**Pashto health literacy assistant** — an offline-capable progressive web app for low-connectivity users in Afghanistan.

SehatYar helps people:
1. Browse **curated health FAQs** in simple Pashto (text + audio)
2. **Identify a household medicine** from a pack photo (OCR → curated catalog → uses and warnings in Pashto)

It does **not** diagnose disease or prescribe medicine. It is information support only. Users should see a doctor or pharmacist when needed.

## Why this exists

Many users face low literacy, weak internet, and medicine packs they cannot read. SehatYar is designed for large tap targets, short answers, audio playback, and offline caching of top content.

## Status

Repository foundation: README, license, and project plan. FAQ UI, medicine OCR, NLP evaluation, and PWA offline support will be added next.

## Planned stack

| Layer | Technology |
|---|---|
| Web (PWA) | Next.js, TypeScript, Tailwind CSS |
| API | Python FastAPI |
| Database | MongoDB Atlas |
| OCR | Tesseract |
| NLP experiments | scikit-learn (+ small neural baseline) |
| Hosting | Netlify/Vercel (web) + Render/Railway (API) |

## Planned layout

```
sehatyar/
  README.md
  LICENSE
  .gitignore
  docs/
  apps/
    web/
    api/
  data/
    faqs/
    medicines/
  experiments/
```

## Documentation

- [Project plan](docs/PROJECT_PLAN.md) — scope, features, stack, safety rules

## Safety

- No automated prescribing  
- No uncontrolled live web medical answers  
- Danger signs point users to clinic care  
- Content is curated and dated  

## Author

Khurshid Khan Ahmadzai  

## License

MIT — see [LICENSE](LICENSE).
