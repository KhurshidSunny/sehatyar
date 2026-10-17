# SehatYar web app

Progressive web app for FAQ browsing and medicine lookup.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Local development

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
2. Start the API from `apps/api` (see that README) so `/categories` and `/faqs` respond.
3. From `apps/web`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## API client

FAQ screens load live data from FastAPI via `lib/api/`:

| Helper | Endpoint |
|---|---|
| `fetchFaqCategories()` | `GET /categories` |
| `fetchFaqSummaries(categoryId?)` | `GET /faqs?category=` |
| `fetchFaq(faqId)` | `GET /faqs/{id}` |
| `postFeedback({ targetType, targetId, helpful })` | `POST /feedback` |

Loading, empty, and error UI live in `components/AsyncState.tsx`. FAQ answer screens include Yes/No helpfulness controls (`components/FaqHelpfulness.tsx`). CORS must allow the web origin (`CORS_ORIGINS` on the API, usually `http://localhost:3000`). Feedback votes require MongoDB on the API.

## Types

Shared TypeScript shapes for FAQ, medicine, and feedback live in `lib/types/` and mirror `apps/api/schemas/`.

## Screens

| Path | Purpose |
|---|---|
| `/` | Home — large entry links for FAQs and medicine lookup |
| `/faqs` | FAQ categories as large tap targets |
| `/faqs/[category]` | Questions in one category, with clinic / emergency badges |
| `/faqs/[category]/[faqId]` | Answer text + Play audio (or “no audio yet”) + Yes/No feedback |
| `/medicines` | Medicine pack photo: camera / gallery, preview, confirm |

Medicine photo UI lives in `components/MedicinePhotoUpload.tsx` (JPEG/PNG/WebP, max 8 MB). Pack text lookup is handled by the OCR API when that endpoint is available.

`components/Disclaimer.tsx` is the permanent non-prescribing notice on each of these screens.

Unknown category or FAQ ids show a not-found empty state. When `audioUrl` is null, the answer screen shows a clear missing-audio state instead of a broken player.

## Notes

- UI targets low-literacy use: large tap targets and short Pashto / English copy.
- Default locale is Pashto (`lang="ps"`, `dir="rtl"`) with Noto Naskh Arabic; English uses LTR.
