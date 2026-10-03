# SehatYar — Project Plan

**Author:** Khurshid Khan Ahmadzai  
**Project:** SehatYar (Pashto health literacy assistant)  
**Updated:** October 2026  
**Status:** Planning complete → implementation starting

---

## 1. Background and motivation

I started thinking about this project after seeing the same pattern many times around me in Afghanistan: someone has a tablet or syrup at home, they cannot read the pack clearly, and they either guess or ask a neighbour. At the same time, people often need short health information in Pashto, but most phone content is text-heavy, in English/Urdu, or needs a stable internet connection.

A few constraints kept coming up in my notes:

1. Literacy is uneven. Text-only apps leave many users behind.
2. Mobile data and connectivity are unreliable. An app that only works online will fail when people need it most.
3. People already keep common medicines at home, but they often do not know what those medicines are for.
4. Giving automatic “take this medicine for your fever” advice would be dangerous. I do not want to build that.

After comparing approaches (chatbots, clinic booking apps, full hospital systems), I decided a smaller and safer product was more realistic: a mobile-friendly web app that (a) answers a limited set of health questions from a curated list, and (b) helps identify a medicine pack and explain its common uses and warnings in simple Pashto, with audio where possible.

That is SehatYar.

---

## 2. Problem statement

**Primary problem:** low-literacy and low-connectivity users in Afghanistan lack a simple, trustworthy way to understand basic health information and household medicine labels in Pashto.

**Secondary problem:** existing tools are often either too complex, language-mismatched, online-only, or unsafe because they try to diagnose and prescribe.

**Design question for this project:**  
Can a progressive web app, backed by a curated knowledge base and lightweight OCR/NLP, improve access to basic health literacy without pretending to replace clinical care?

---

## 3. Goals

### Product goals
- Make basic health FAQs usable through large buttons, short Pashto text, and audio playback.
- Help users identify common household medicines from a photo or typed name.
- Keep the app usable on weak networks through offline caching of important content.
- Stay clearly in the “information support” role, not diagnosis or prescription.

### Technical / research goals
- Build a clean PWA + API architecture that I can maintain and explain.
- Evaluate FAQ matching with measurable methods (classical text matching and a small neural baseline).
- Document OCR accuracy limits on real medicine pack photos.
- Keep content curated, dated, and reviewable.

### Non-goals (for the first version)
- Replacing doctors, pharmacists, or emergency services.
- Unlimited medical Q&A from the open web.
- Perfect Pashto speech recognition.
- Full hospital / clinic management software.
- Native Android/iOS apps (can come later if the PWA works).

---

## 4. Target users

| User | Need | How SehatYar helps |
|---|---|---|
| Adults with limited reading ability | Understand short health advice | Audio answers + simple text |
| Family members helping relatives | Check what a medicine pack is | Photo / name lookup |
| Users with weak internet | Access basic content offline | Cached FAQs and audio |
| Community health workers (later) | Share consistent explanations | Same curated answers |

First language for MVP: **Pashto**. Dari can be added later as a second pack.

---

## 5. What I researched before deciding the scope

Before locking features, I looked at:

- Common household medicines people keep (pain/fever tablets, ORS, antibiotics, cough syrups, iron, etc.).
- Why OCR is a better first step than “AI diagnosis from symptoms” for safety.
- Why browser speech-to-text for Pashto is still weak, so pre-recorded answers are more reliable than live TTS/ASR for v1.
- Why a PWA is a better starting point than React Native for my current skills and for fast iteration.
- Why a curated database is safer than scraping medical websites for each user query.

**Decision:** MVP = FAQ categories + medicine identification + offline cache + evaluation notes.  
No prescribing. No uncontrolled live medical search.

---

## 6. Main features (MVP)

### 6.1 Home screen
- Two clear entry points:
  1. Health questions
  2. What is this medicine?
- Always-visible disclaimer: information only, not a doctor.

### 6.2 Health FAQ
- Categories such as: fever, child care basics, diarrhea/ORS, pregnancy basics, vaccines, when to visit a clinic.
- Each category shows short questions.
- Each answer shows Pashto text + play audio.
- Optional “Was this helpful?” feedback.

### 6.3 Medicine identification
- Upload / capture a medicine pack photo.
- Extract text with OCR.
- Match against a curated medicine list.
- Show common uses and warnings in Pashto (+ audio when available).
- If OCR fails, allow typing the medicine name.

### 6.4 Offline support
- Cache top FAQs and audio files.
- Show a simple offline / cached indicator.

### 6.5 Evaluation support
- Keep datasets and scripts for FAQ matching experiments.
- Record method, metrics, and limits in project docs.

---

## 7. Safety and content rules

These rules are fixed for the project:

1. Do not recommend a specific dose or say “take medicine X for symptom Y.”
2. Do not pull live answers from random websites into the user-facing flow.
3. For danger signs, push the user toward clinic / emergency care.
4. Every FAQ and medicine entry should have a source note and last-reviewed date.
5. If confidence is low (weak OCR match), say so and offer typed search.

I will treat content quality as part of the product, not as an afterthought.

---

## 8. System design

```
User phone (browser / PWA)
        |
        | HTTPS
        v
Next.js frontend
        |
        | REST
        v
Python FastAPI
   - FAQ APIs
   - Intent / text match
   - Medicine OCR + catalog match
   - Feedback storage
        |
        v
MongoDB Atlas
   - faqs
   - medicines
   - feedback
```

Offline path: service worker serves recently cached FAQ/audio content when the network is down.

---

## 9. Technology choices

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind | Fast UI iteration, good PWA path, stack I already use |
| Backend | FastAPI (Python) | Clean APIs; easy place for OCR and NLP experiments |
| Database | MongoDB Atlas | Flexible documents for FAQs/medicines; free tier for MVP |
| OCR | Tesseract + Pillow | Free and good enough for printed pack text |
| NLP | scikit-learn (+ small neural baseline) | Honest baselines I can evaluate and explain |
| Hosting | Netlify/Vercel (web), Render/Railway (API) | Low cost while the project is early |



---

## 10. Data design (first version)

### FAQ entry
- category
- question (Pashto)
- answer (Pashto)
- optional paraphrases (for matching tests)
- audio file path
- danger level
- source / last reviewed

### Medicine entry
- list of names (English + local spellings where useful)
- uses (Pashto)
- warnings (Pashto)
- audio file path
- source / last reviewed

### Feedback entry
- target type (faq / medicine)
- helpful yes/no
- timestamp  
No personal identity required for MVP.

---

## 11. Implementation phases

### Phase 1 — Foundation
- Repository structure (`apps/web`, `apps/api`, `data`, `docs`, `experiments`)
- Seed FAQ and medicine content files
- Safety / content notes

### Phase 2 — API and FAQ UI
- FastAPI health check and FAQ endpoints
- Home + category + answer screens
- Audio playback

### Phase 3 — Medicine path
- Image upload
- OCR extraction
- Catalog matching
- Result screen + typed fallback

### Phase 4 — Offline PWA
- Manifest + service worker
- Cache important FAQs/audio
- Offline status in UI

### Phase 5 — Matching experiments
- Train/evaluate FAQ text matching
- Compare classical vs small neural baseline
- Write a short technical note with metrics and limits

### Phase 6 — Polish
- Better empty/error states
- Demo recording
- README install and run instructions

---

## 12. Success criteria for v1

I will consider the first version successful if:

1. A new user can open the app and reach a FAQ answer in under a minute.
2. At least one medicine pack photo path works end-to-end on a common medicine.
3. Top FAQ content still opens when offline after a first visit.
4. Disclaimer is visible and the product never gives dosing instructions.
5. I can show numbers for FAQ matching quality and explain where OCR fails.

---

## 13. Risks and how I plan to handle them

| Risk | Plan |
|---|---|
| Pashto ASR/TTS quality is poor | Use pre-recorded audio for answers in v1 |
| OCR fails on blurry photos | Typed name fallback + image guidance (“hold steady, good light”) |
| Medical content mistakes | Keep a small curated set; review before adding more |
| Scope grows too large | Freeze MVP features listed above |
| Backend free tier sleeps | Keep FAQ static fallback / cache for core content |

---

## 14. Repository layout (planned)

```
sehatyar/
  README.md
  LICENSE
  .gitignore
  docs/
    PROJECT_PLAN.md
    CONTENT_AND_SAFETY.md
  apps/
    web/                 # Next.js PWA
    api/                 # FastAPI
  data/
    faqs/
    medicines/
  experiments/           # NLP / OCR evaluation scripts
  public-audio/          # or apps/web/public/audio
```

---

## 15. Open questions I will resolve during build

1. Exact first set of FAQ categories (6 vs 8).
2. How many medicines are enough for a useful demo (target: ~40 common items).
3. Whether admin editing stays as JSON/CLI only for v1 (likely yes).
4. When to add Dari — only after Pashto MVP is stable.

---

## 16. Summary

SehatYar is a focused health literacy tool for Afghanistan’s real constraints: language, literacy, and connectivity. The first version will stay small on purpose — curated FAQs, medicine pack identification, offline support, and clear safety limits — so that it can actually be finished, tested, and improved with evidence instead of becoming an unsafe medical chatbot.
