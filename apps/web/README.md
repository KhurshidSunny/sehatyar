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

## Notes

- UI targets low-literacy use: large tap targets, short Pashto copy, audio playback later.
- Home route is a placeholder with two entry points and a permanent non-prescribing disclaimer.
- Offline caching of top FAQs and audio is part of the product design (later commits).
- API base URL wiring comes when FAQ/medicine screens are connected.
