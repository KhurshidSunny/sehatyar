"""Load medicine catalog from curated JSON and search by name."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from rapidfuzz import fuzz

from config import get_settings
from schemas.medicine import Medicine, MedicineCategory, MedicineSummary

_API_ROOT = Path(__file__).resolve().parents[1]

# Drop weak matches so typos still hit but unrelated tokens do not.
_DEFAULT_MIN_SCORE = 75.0


def _resolve_medicine_dir() -> Path:
    settings = get_settings()
    raw = Path(settings.medicine_data_dir)
    if raw.is_absolute():
        return raw
    return (_API_ROOT / raw).resolve()


def _load_json(path: Path) -> object:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache
def _catalog() -> tuple[tuple[MedicineCategory, ...], tuple[Medicine, ...]]:
    medicine_dir = _resolve_medicine_dir()
    categories_path = medicine_dir / "categories.json"
    if not categories_path.is_file():
        raise FileNotFoundError(
            f"Medicine categories file not found: {categories_path}"
        )

    categories = tuple(
        sorted(
            (
                MedicineCategory.model_validate(item)
                for item in _load_json(categories_path)
            ),
            key=lambda c: c.order,
        )
    )
    known_ids = {c.id for c in categories}

    medicines: list[Medicine] = []
    for path in sorted(medicine_dir.glob("*.json")):
        if path.name == "categories.json":
            continue
        payload = _load_json(path)
        if not isinstance(payload, list):
            raise ValueError(f"Medicine file must be a JSON array: {path}")
        for item in payload:
            medicine = Medicine.model_validate(item)
            if medicine.category not in known_ids:
                raise ValueError(
                    f"Medicine {medicine.id} references unknown category "
                    f"{medicine.category!r}"
                )
            medicines.append(medicine)

    return categories, tuple(medicines)


def clear_cache() -> None:
    _catalog.cache_clear()


def list_categories() -> list[MedicineCategory]:
    categories, _ = _catalog()
    return list(categories)


def list_medicines() -> list[Medicine]:
    _, medicines = _catalog()
    return list(medicines)


def get_medicine(medicine_id: str) -> Medicine:
    _, medicines = _catalog()
    for medicine in medicines:
        if medicine.id == medicine_id:
            return medicine
    raise KeyError(medicine_id)


def to_summary(medicine: Medicine) -> MedicineSummary:
    return MedicineSummary(
        id=medicine.id,
        category=medicine.category,
        names=medicine.names,
        usesPs=medicine.usesPs,
        usesEn=medicine.usesEn,
        warningsPs=medicine.warningsPs,
        warningsEn=medicine.warningsEn,
        audioUrl=medicine.audioUrl,
    )


def _best_name_score(query: str, names: list[str]) -> float:
    query_norm = query.strip().casefold()
    if not query_norm:
        return 0.0
    best = 0.0
    for name in names:
        name_cf = name.casefold()
        # WRatio for typos/brand spellings; substring boost for OCR fragments.
        score = float(fuzz.WRatio(query_norm, name_cf))
        if query_norm in name_cf or name_cf in query_norm:
            score = max(score, 92.0)
        if score > best:
            best = score
    return best


def search_by_name(
    query: str,
    *,
    limit: int = 10,
    min_score: float = _DEFAULT_MIN_SCORE,
) -> list[MedicineSummary]:
    """Return medicines whose names[] best fuzzy-match the query."""
    _, medicines = _catalog()
    scored: list[tuple[float, Medicine]] = []
    for medicine in medicines:
        score = _best_name_score(query, medicine.names)
        if score >= min_score:
            scored.append((score, medicine))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return [to_summary(medicine) for _, medicine in scored[:limit]]
