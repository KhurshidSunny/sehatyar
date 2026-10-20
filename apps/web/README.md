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
| `postMedicineOcr(file)` | `POST /medicines/ocr` (multipart `image`) |
| `searchMedicines(q)` | `GET /medicines/search?q=` |

Loading, empty, and error UI live in `components/AsyncState.tsx`. FAQ answer screens include Yes/No helpfulness controls (`components/FaqHelpfulness.tsx`). Medicine photo submit calls OCR and shows ranked catalog matches with confidence. When OCR finds nothing (or fails), typed name search calls `/medicines/search`. CORS must allow the web origin (`CORS_ORIGINS` on the API, usually `http://localhost:3000`). Feedback votes require MongoDB on the API. OCR requires Tesseract on the API host.

## Types

Shared TypeScript shapes for FAQ, medicine, and feedback live in `lib/types/` and mirror `apps/api/schemas/`.

## Screens

| Path | Purpose |
|---|---|
| `/` | Home — large entry links for FAQs and medicine lookup |
| `/faqs` | FAQ categories as large tap targets |
| `/faqs/[category]` | Questions in one category, with clinic / emergency badges |
| `/faqs/[category]/[faqId]` | Answer text + Play audio (or “no audio yet”) + Yes/No feedback |
| `/medicines` | Medicine pack photo or typed name search |

Medicine photo UI lives in `components/MedicinePhotoUpload.tsx` (JPEG/PNG/WebP, max 8 MB). Submit sends the image to `POST /medicines/ocr` and lists fuzzy catalog matches. Typed fallback uses `components/MedicineNameSearch.tsx` → `GET /medicines/search`.

`components/Disclaimer.tsx` is the permanent non-prescribing notice on each of these screens.

Unknown category or FAQ ids show a not-found empty state. When `audioUrl` is null, the answer screen shows a clear missing-audio state instead of a broken player.

## PWA

- `app/manifest.ts` serves the web app manifest (standalone display, theme `#0f766e`, 192/512 icons).
- Icons live in `public/` (`icon-192.png`, `icon.png`, `apple-icon.png`).
- `public/sw.js` registers via `components/ServiceWorkerRegister.tsx`.
- Offline pack: `public/offline/top-faqs.json` (categories + top FAQs: emergency, clinic, and first item per category). Precached on install.
- Audio files go under `public/offline/audio/` and are listed in the pack’s `audioUrls` (none shipped yet). The client warms those URLs into the same cache when present.
- FAQ helpers in `lib/api/faqs.ts` fall back to the offline pack when the API is unreachable. FAQs outside the pack still need the network.
- `OfflineBanner` shows under the chrome bar when the device is offline.
- FAQ screens show a “Saved content” badge when the response came from the offline pack (`fromCache`).

After `npm run build` and `npm run start` (or a deployed HTTPS origin), Chromium can offer “Install app”. Service workers need a secure context (localhost or HTTPS).

## Notes

- UI targets low-literacy use: large tap targets and short Pashto / English copy.
- Default locale is Pashto (`lang="ps"`, `dir="rtl"`) with Noto Naskh Arabic; English uses LTR.
