# Experiments

Offline evaluation scripts and datasets for FAQ intent matching and related checks.

This folder is separate from the live API. It is used to compare methods, record metrics, and keep evaluation reproducible.

## Expected work

- Paraphrase / intent datasets for FAQ matching
- Classical baselines (for example TF-IDF classifiers)
- A small neural baseline for comparison
- Short result notes with precision, recall, or accuracy on held-out examples

## Layout

```
experiments/
  README.md
  data/          # evaluation splits (added when ready)
  # scripts and result docs added as evaluation work lands
```

## Notes

- Prefer small, honest demos over overstated accuracy claims.
- Keep generated model artifacts out of git unless intentionally versioned.
