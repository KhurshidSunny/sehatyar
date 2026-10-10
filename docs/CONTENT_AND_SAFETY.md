# Content and safety policy

Rules for all SehatYar health FAQs, medicine catalog entries, UI copy, API responses, and audio scripts. The product is **information support** only. It does not diagnose disease or prescribe medicine.

## 1. Product boundaries

SehatYar may:

- Answer a fixed set of curated health questions in simple Pashto (text + optional audio).
- Help identify a household medicine from a pack photo or typed name against a curated catalog.
- Show common uses and warnings for a matched medicine.
- Point users to clinic or emergency care when danger signs appear.

SehatYar must not:

- Diagnose a disease from symptoms.
- Tell a user to take a specific medicine for a symptom (“take X for fever”).
- Recommend a dose, schedule, or duration of treatment.
- Replace a doctor, midwife, or pharmacist.
- Pull live answers from the open web into the user-facing flow.

When a request is outside these boundaries, the app should say so briefly and direct the user to a clinic or pharmacist.

## 2. Allowed content

| Area | Allowed |
|---|---|
| FAQ answers | Short, plain Pashto; home-care tips that do not name a drug as treatment; when to seek care |
| Medicine `usesPs` | General description of what the medicine is commonly used for |
| Medicine `warningsPs` | Allergies, when not to self-medicate, danger signs, “ask a doctor or pharmacist” |
| OCR / search | Show catalog match(es) with confidence; offer typed search if OCR is weak |
| UI disclaimer | Always visible: information only — not a diagnosis or prescription |

## 3. Forbidden content

Do not publish or generate:

1. **Prescribing language** — specific dose, “take N tablets”, “give this to your child for…”.
2. **Symptom → drug mapping** — choosing a medicine based on the user’s described illness.
3. **Uncurated live medical search** — scraping or displaying unchecked web pages as answers.
4. **False certainty** — claiming the app can confirm a diagnosis or guarantee a cure.
5. **Dangerous advice** — delaying emergency care, stopping a prescribed medicine without clinical advice, or using alcohol/harmful home remedies as treatment.
6. **Personal medical records** — storing identifiable patient histories beyond anonymous feedback votes.

## 4. FAQ rules

- Every FAQ has: `questionPs`, `answerPs`, `dangerLevel`, `source`, `lastReviewed`, `reviewStatus`.
- Prefer short answers suited to audio playback.
- Use `dangerLevel`:
  - `info` — general self-care information
  - `clinic` — see a clinic soon
  - `emergency` — go to hospital / emergency care now
- Paraphrases (`paraphrasesPs`) help matching; they must not introduce unsafe advice.
- New FAQs stay `reviewStatus: "draft"` until a health-aware review is recorded.

## 5. Medicine catalog and OCR rules

- Catalog entries identify a product and explain common uses and warnings only.
- `names[]` may include English and local spellings for search and OCR matching.
- Never invent a medicine that is not in the curated catalog for a user-facing “match”.
- If OCR confidence is low or several names are close:
  - say the match is uncertain
  - show alternatives when useful
  - offer typed name search
- Antibiotics and chronic medicines (e.g. insulin, blood pressure drugs) must stress “doctor’s prescription / supervision” in warnings.
- Do not treat a catalog hit as permission to start, stop, or change treatment.

## 6. Disclaimer (user-facing)

The home screen and medicine/FAQ result screens must keep a clear disclaimer, in Pashto (and English where the UI already uses English), that:

- content is information only
- it is not a diagnosis or prescription
- users should seek clinic care for serious or unclear symptoms

Wording may be shortened for mobile layout, but the meaning must not be softened.

## 7. Sources and dating

- Prefer recognised public health references (e.g. WHO guidance, package-insert style label facts) for FAQ and medicine text.
- Store `source.title` and `source.url` when a stable public link exists; `url` may be `null` when only a general reference applies.
- Set `lastReviewed` (`YYYY-MM-DD`) whenever content is checked or changed.
- Unpublished or unfinished entries remain `reviewStatus: "draft"`.

## 8. Content review process

1. **Author** drafts or edits JSON under `data/faqs/` or `data/medicines/` following this policy and `data/README.md`.
2. **Self-check** against Section 3 (forbidden content) before opening a pull request or merge.
3. **Health-aware review** (clinician, pharmacist, or trained reviewer when available) marks `reviewStatus: "reviewed"` and updates `lastReviewed`.
4. **Draft in production:** draft entries may ship for early demos, but the UI or docs should not imply they are clinically signed off.
5. **Corrections:** unsafe text is fixed or removed first; new features wait.

Anonymous helpfulness votes (FAQ / medicine) inform prioritisation; they do not replace this review chain.

## 9. Out-of-scope user requests

If the user asks for diagnosis, dosing, or “which medicine should I buy for …”:

- Refuse the prescribing part politely.
- Offer a relevant curated FAQ or medicine **identification** path when it fits.
- Repeat that a doctor or pharmacist must decide treatment.
- For emergency signs (difficulty breathing, seizures, heavy bleeding, unconsciousness, etc.), push emergency / hospital care immediately.

## 10. Related documents

| Document | Role |
|---|---|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Scope and product decisions |
| [../data/README.md](../data/README.md) | FAQ and medicine field definitions |
| [../README.md](../README.md) | Project overview and safety summary |
| [../apps/api/README.md](../apps/api/README.md) | API must stay informational |
| [../apps/web/README.md](../apps/web/README.md) | UI disclaimer expectations |
