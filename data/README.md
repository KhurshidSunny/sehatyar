# Curated content

Seed data for SehatYar. All health and medicine text must stay non-prescribing and reviewable.

## Folders

| Path | Contents |
|---|---|
| `faqs/` | FAQ entries by category (Pashto text, optional audio URLs, paraphrases) |
| `medicines/` | Household medicine catalog (names, uses, warnings, optional audio) |

## FAQ files

`faqs/categories.json` lists the categories in display order (`id`, `namePs`, `nameEn`, `order`). Each other file in `faqs/` holds the FAQs for one category, named after the category `id`.

| Field | Meaning |
|---|---|
| `id` | Stable id, `{category}-{NN}` |
| `category` | Category `id` from `categories.json` |
| `questionPs` | Question shown to the user |
| `questionEn` | English gloss for content review |
| `answerPs` | Short answer shown and read aloud |
| `paraphrasesPs` | Other ways users ask the same question, used for intent matching |
| `audioUrl` | Recorded answer path, or `null` until recorded |
| `dangerLevel` | `info` (self-care), `clinic` (visit a clinic soon), or `emergency` (go to hospital now) |
| `source` | `title` of the reference and its `url` when it has a stable public link |
| `lastReviewed` | Date the entry was last checked (`YYYY-MM-DD`) |
| `reviewStatus` | `draft` until checked by a health worker, then `reviewed` |

## Rules

- Prefer short, clear Pashto.
- Include danger-sign language that points users to clinic care when needed.
- Keep sources and review dates with content where practical.
- Do not store secrets or personal user data here.
