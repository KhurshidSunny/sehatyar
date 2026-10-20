# Experiments

Offline evaluation scripts and datasets for FAQ intent matching and related checks.

This folder is separate from the live API. It is used to compare methods, record metrics, and keep evaluation reproducible.

## Layout

```
experiments/
  README.md
  data/
    intent_train.jsonl      # train utterances (question + paraphrases)
    intent_test.jsonl       # held-out utterances (fixed seed)
    intent_split_meta.json  # counts, seed, and file names
  scripts/
    export_intent_split.py  # rebuild train/test from data/faqs
```

## Intent split

Each FAQ contributes its canonical `questionPs` plus `paraphrasesPs` as labeled examples (`faqId`, `category`, `source`).

Rebuild after FAQ edits:

```bash
python experiments/scripts/export_intent_split.py
```

Current seed data: 42 FAQs, each with the canonical `questionPs` plus 6 `paraphrasesPs` (7 utterances). With `seed=42`, two paraphrases per FAQ are held out for test → 210 train and 84 test rows.

## Expected next work

- Classical baselines (for example TF-IDF classifiers)
- A small neural baseline for comparison
- Short result notes with precision, recall, or accuracy on held-out examples

## Notes

- Prefer small, honest demos over overstated accuracy claims.
- Keep generated model artifacts out of git unless intentionally versioned.
