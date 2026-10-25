# SehatYar — demo and evaluation guide

Practical walkthrough for anyone trying the product: community partners, developers, or health-content reviewers. Goal: see how SehatYar helps Afghan users who need simple Pashto health information and help reading household medicine packs — especially when literacy or connectivity is limited.

Start with the [technical note](TECHNICAL_NOTE.md) if you want problem / method / metrics first. Safety rules: [CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md).

## 1. What to look for

1. **FAQ path** — large categories → short Pashto answer → audio when available → disclaimer visible.
2. **Medicine path** — pack photo or typed name → catalog match → uses and warnings (no dose).
3. **Offline** — after a first online visit, top FAQs still available with a clear offline / cached indicator.
4. **Language** — Pashto-first UI; English switch for helpers who support a relative.
5. **Honesty** — empty OCR results offer typed search; the app does not invent a diagnosis.

## 2. Try the live app (preferred)

Open **https://sehatyar-iota.vercel.app** in a phone or desktop browser.

Use this for the walkthrough below unless you need to change code. Local setup is only if the live site is down or you are developing.

## 3. Run locally (optional)

**API** (`apps/api`):

```bash
cd apps/api
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# set MONGO_URI if you want feedback votes; FAQ/medicine reads work from JSON seed
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check `http://127.0.0.1:8000/health`. OCR needs Tesseract on PATH (or `TESSERACT_CMD` in `.env`).

**Web** (`apps/web`):

```bash
cd apps/web
copy .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Demo walkthrough (~8–10 minutes)

These are **manual steps to click through the product** while explaining it — not a shell or code script.

### A. Home and literacy-friendly FAQ (≈3 min)

1. Open `/` — note the two large entry points (FAQs / medicine).
2. Open `/faqs` — tap a category (e.g. fever or diarrhea/ORS).
3. Open one question — confirm short Pashto text and the disclaimer.
4. Tap **Play** if audio is present; if not, note the “no audio yet” state.
5. Optional: switch language with the control in the chrome; switch back to Pashto.
6. Optional: use Yes/No helpfulness once (needs MongoDB on the API).

**Talking point:** answers are curated and short so they can be read aloud or played as audio for users who do not read comfortably.

### B. Medicine pack — photo then fallback (≈3 min)

1. Open `/medicines`.
2. Upload or capture a clear pack photo of a common catalog item (good light, label facing camera).
3. Show OCR text + ranked matches and open a result (uses / warnings in Pashto).
4. Repeat with a blurry or angled photo **or** skip photo and use **typed name search** for the same medicine.

**Talking point:** OCR will fail in real homes; typed search is intentional, not an afterthought. The app never recommends a dose.

### C. Offline / weak network (≈2 min)

1. While online, open a few top FAQs (and play audio once if available) so the service worker can cache them.
2. Turn on the browser’s offline mode (or disable network).
3. Confirm the offline banner / cached-content indicator and that a previously visited FAQ still opens.

**Talking point:** the product is built for intermittent connectivity, not only for ideal broadband.

### D. Intent API (optional, ≈2 min)

```bash
curl -s -X POST http://127.0.0.1:8000/predict-intent ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"تبه لپاره څه وکړم\"}"
```

(Use a real Pashto paraphrase from `data/faqs/` or `experiments/data/intent_test.jsonl`.)

Expect `faqId`, `category`, `score`, and `candidates`. Metrics and limits: [nlp-evaluation.md](nlp-evaluation.md).

**Talking point:** ranking helps find a curated FAQ; it is not clinical decision support. Prefer showing a shortlist when confidence is unclear.

## 5. Checklist

| Check | Pass if… |
|---|---|
| Disclaimer | Visible on answer / medicine result flows |
| FAQ UX | Large taps; Pashto readable; audio or honest empty state |
| Medicine UX | Match or clear empty state + typed search |
| No prescribing | No dose / “take this for your symptom” language |
| Offline | Cached FAQ still opens; status UI visible |
| Content | Entries look curated (source / reviewed fields in data or UI where shown) |

## 6. Known limits to state during a demo

- FAQ and medicine catalogs are small on purpose.
- Intent metrics use paraphrases, not field user logs.
- OCR quality varies with photo quality and packaging language.
- Offline covers the top FAQ pack, not every feature (e.g. live OCR needs the API).

## 7. Suggested reading order

1. This guide (demo steps)
2. [TECHNICAL_NOTE.md](TECHNICAL_NOTE.md)
3. [CONTENT_AND_SAFETY.md](CONTENT_AND_SAFETY.md)
4. [nlp-evaluation.md](nlp-evaluation.md)
5. Root [README.md](../README.md)
