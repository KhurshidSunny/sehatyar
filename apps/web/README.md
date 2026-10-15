# SehatYar web app

Progressive web app for FAQ browsing and medicine lookup.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Local development

From `apps/web`:

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

## Types

Shared TypeScript shapes for FAQ, medicine, and feedback live in `lib/types/` and mirror `apps/api/schemas/`.

## Screens

| Path | Purpose |
|---|---|
| `/` | Home — large entry links for FAQs and medicine lookup |
| `/faqs` | FAQ categories as large tap targets |
| `/faqs/[category]` | Questions in one category, with clinic / emergency badges |
| `/medicines` | Medicine lookup section |

`components/Disclaimer.tsx` is the permanent non-prescribing notice on each of these screens.

FAQ screens are rendered at build time from the curated JSON in `data/faqs/` (see `lib/faqContent.ts`). Unknown category ids return 404.

## Notes

- UI targets low-literacy use: large tap targets and short Pashto copy.
- Layout is right-to-left (`lang="ps"`, `dir="rtl"`) with Noto Naskh Arabic for Pashto text.
