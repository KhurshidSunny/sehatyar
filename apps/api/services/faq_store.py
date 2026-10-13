"""Load FAQ categories and entries from curated JSON under data/faqs/."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from config import get_settings
from schemas.faq import Faq, FaqCategory, FaqSummary


_API_ROOT = Path(__file__).resolve().parents[1]


def _resolve_faq_dir() -> Path:
    settings = get_settings()
    raw = Path(settings.faq_data_dir)
    if raw.is_absolute():
        return raw
    # Relative paths in .env are anchored at apps/api.
    return (_API_ROOT / raw).resolve()


def _load_json(path: Path) -> object:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache
def _catalog() -> tuple[tuple[FaqCategory, ...], tuple[Faq, ...]]:
    faq_dir = _resolve_faq_dir()
    categories_path = faq_dir / "categories.json"
    if not categories_path.is_file():
        raise FileNotFoundError(f"FAQ categories file not found: {categories_path}")

    categories = tuple(
        sorted(
            (FaqCategory.model_validate(item) for item in _load_json(categories_path)),
            key=lambda c: c.order,
        )
    )
    known_ids = {c.id for c in categories}

    faqs: list[Faq] = []
    for path in sorted(faq_dir.glob("*.json")):
        if path.name == "categories.json":
            continue
        payload = _load_json(path)
        if not isinstance(payload, list):
            raise ValueError(f"FAQ file must be a JSON array: {path}")
        for item in payload:
            faq = Faq.model_validate(item)
            if faq.category not in known_ids:
                raise ValueError(
                    f"FAQ {faq.id} references unknown category {faq.category!r}"
                )
            faqs.append(faq)

    return categories, tuple(faqs)


def clear_cache() -> None:
    """Drop the in-memory catalog (useful after content edits in development)."""
    _catalog.cache_clear()


def list_categories() -> list[FaqCategory]:
    categories, _ = _catalog()
    return list(categories)


def list_faqs(*, category: str | None = None) -> list[Faq]:
    categories, faqs = _catalog()
    if category is None:
        return list(faqs)
    known = {c.id for c in categories}
    if category not in known:
        raise KeyError(category)
    return [faq for faq in faqs if faq.category == category]


def get_faq(faq_id: str) -> Faq:
    _, faqs = _catalog()
    for faq in faqs:
        if faq.id == faq_id:
            return faq
    raise KeyError(faq_id)


def to_summary(faq: Faq) -> FaqSummary:
    return FaqSummary(
        id=faq.id,
        category=faq.category,
        questionPs=faq.questionPs,
        dangerLevel=faq.dangerLevel,
        audioUrl=faq.audioUrl,
    )
