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

- UI targets low-literacy use: large tap targets and short Pashto copy.
- The home screen has two entry points (health questions, medicine lookup) and a permanent disclaimer that the app does not diagnose or prescribe.
- Layout is right-to-left (`lang="ps"`, `dir="rtl"`) with Noto Naskh Arabic for Pashto text.
