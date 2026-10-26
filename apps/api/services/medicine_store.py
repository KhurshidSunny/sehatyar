"""Load medicine catalog from curated JSON and search by name / OCR text."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from rapidfuzz import fuzz

from config import get_settings
from schemas.medicine import Medicine, MedicineCategory, MedicineForm, MedicineSummary

_API_ROOT = Path(__file__).resolve().parents[1]

# Drop weak matches so typos still hit but unrelated tokens do not.
_DEFAULT_MIN_SCORE = 70.0
_OCR_MIN_SCORE = 82.0

_SKIP_MEDICINE_FILES = frozenset({"categories.json", "forms.json"})


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
def _catalog() -> tuple[
    tuple[MedicineCategory, ...],
    tuple[MedicineForm, ...],
    tuple[Medicine, ...],
]:
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

    forms_path = medicine_dir / "forms.json"
    forms: tuple[MedicineForm, ...] = ()
    if forms_path.is_file():
        forms = tuple(
            sorted(
                (
                    MedicineForm.model_validate(item)
                    for item in _load_json(forms_path)
                ),
                key=lambda f: f.order,
            )
        )
    known_forms = {f.id for f in forms}

    medicines: list[Medicine] = []
    for path in sorted(medicine_dir.glob("*.json")):
        if path.name in _SKIP_MEDICINE_FILES:
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
            if known_forms:
                for form_id in medicine.forms:
                    if form_id not in known_forms:
                        raise ValueError(
                            f"Medicine {medicine.id} references unknown form "
                            f"{form_id!r}"
                        )
            medicines.append(medicine)

    return categories, forms, tuple(medicines)


def clear_cache() -> None:
    _catalog.cache_clear()


def list_categories() -> list[MedicineCategory]:
    categories, _, _ = _catalog()
    return list(categories)


def list_forms() -> list[MedicineForm]:
    _, forms, _ = _catalog()
    return list(forms)


def list_medicines() -> list[Medicine]:
    _, _, medicines = _catalog()
    return list(medicines)


def get_medicine(medicine_id: str) -> Medicine:
    _, _, medicines = _catalog()
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
        forms=list(medicine.forms),
    )


def _best_name_score(query: str, names: list[str]) -> float:
    query_norm = query.strip().casefold()
    if not query_norm:
        return 0.0
    best = 0.0
    for name in names:
        name_cf = name.casefold()
        score = max(
            float(fuzz.WRatio(query_norm, name_cf)),
            float(fuzz.partial_ratio(query_norm, name_cf)),
            float(fuzz.token_set_ratio(query_norm, name_cf)),
        )
        if query_norm in name_cf or name_cf in query_norm:
            score = max(score, 92.0)
        if score > best:
            best = score
    return best


def _filter_by_form(
    medicines: tuple[Medicine, ...] | list[Medicine],
    form: str | None,
) -> list[Medicine]:
    if not form:
        return list(medicines)
    form_cf = form.strip().casefold()
    if not form_cf:
        return list(medicines)
    return [m for m in medicines if form_cf in {f.casefold() for f in m.forms}]


def search_by_name(
    query: str,
    *,
    limit: int = 10,
    min_score: float = _DEFAULT_MIN_SCORE,
    form: str | None = None,
) -> list[MedicineSummary]:
    """Return medicines whose names[] best fuzzy-match the query."""
    _, _, medicines = _catalog()
    pool = _filter_by_form(medicines, form)
    scored: list[tuple[float, Medicine]] = []
    for medicine in pool:
        score = _best_name_score(query, medicine.names)
        if score >= min_score:
            scored.append((score, medicine))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return [to_summary(medicine) for _, medicine in scored[:limit]]


def confidence_for_score(score: float) -> str:
    if score >= 85:
        return "high"
    if score >= 72:
        return "medium"
    return "low"


# Pack boilerplate — never treat these alone as a medicine identity match.
_GENERIC_OCR_TOKENS = frozenset(
    {
        "tablet",
        "tablets",
        "capsule",
        "capsules",
        "syrup",
        "drops",
        "drop",
        "oral",
        "film",
        "coated",
        "cream",
        "ointment",
        "solution",
        "suspension",
        "extra",
        "forte",
        "plus",
        "adult",
        "child",
        "children",
        "infant",
        "dose",
        "each",
        "contains",
        "sodium",
        "acid",
        "hydrate",
        "water",
        "sugar",
        "free",
        "pack",
        "box",
        "mg",
        "ml",
        "gmbh",
        "limited",
        "ltd",
        "pharma",
        "pharmaceutical",
        "pharmaceuticals",
        "company",
        "manufacture",
        "manufactured",
        "keep",
        "reach",
        "children",
        "store",
        "cool",
        "dry",
        "place",
    }
)


def _ocr_tokens(ocr_text: str) -> list[str]:
    """Latin word tokens from OCR (keep short brand-like words)."""
    cleaned = " ".join(ocr_text.split())
    tokens: list[str] = []
    for token in re.split(r"[^A-Za-z0-9]+", cleaned):
        letters = "".join(ch for ch in token if ch.isalpha()).casefold()
        if len(letters) < 3 or letters in _GENERIC_OCR_TOKENS:
            continue
        tokens.append(letters)
    seen: set[str] = set()
    unique: list[str] = []
    for token in tokens:
        if token in seen:
            continue
        seen.add(token)
        unique.append(token)
    return unique


def _ocr_phrases(ocr_text: str) -> list[str]:
    """Single tokens plus adjacent bigrams for multi-word brand names."""
    tokens = _ocr_tokens(ocr_text)
    phrases = list(tokens)
    for i in range(len(tokens) - 1):
        phrases.append(f"{tokens[i]} {tokens[i + 1]}")
    # Also try each non-empty OCR line as a phrase.
    for line in ocr_text.splitlines():
        cleaned = " ".join(line.split()).casefold()
        letters = "".join(ch for ch in cleaned if ch.isalpha())
        if len(letters) >= 4:
            phrases.append(cleaned)
    # Full OCR blob once.
    full = " ".join(ocr_text.split()).casefold()
    if len(full) >= 4:
        phrases.append(full)
    # Dedupe preserving order.
    seen: set[str] = set()
    out: list[str] = []
    for phrase in phrases:
        if phrase in seen:
            continue
        seen.add(phrase)
        out.append(phrase)
    return out


def _distinctive_name_words(name_cf: str) -> list[str]:
    words = [
        "".join(ch for ch in w if ch.isalpha())
        for w in name_cf.replace("-", " ").split()
    ]
    return [w for w in words if len(w) >= 3 and w not in _GENERIC_OCR_TOKENS]


def _catalog_name_anchors() -> frozenset[str]:
    """All distinctive Latin catalog name fragments."""
    _, _, medicines = _catalog()
    anchors: set[str] = set()
    for medicine in medicines:
        for name in medicine.names:
            name_cf = name.casefold().strip()
            ascii_letters = sum(1 for ch in name_cf if ch.isascii() and ch.isalpha())
            if ascii_letters < 3:
                continue
            for word in _distinctive_name_words(name_cf):
                anchors.add(word)
            compact = "".join(ch for ch in name_cf if ch.isalpha())
            if len(compact) >= 4:
                anchors.add(compact)
    return frozenset(anchors)


def ocr_has_medicine_anchor(ocr_text: str) -> bool:
    """
    True when OCR contains a near-exact catalog name fragment.
    Used as a soft signal; matching no longer hard-requires this alone.
    """
    tokens = _ocr_tokens(ocr_text)
    if not tokens:
        return False
    anchors = _catalog_name_anchors()
    for token in tokens:
        if token in anchors:
            return True
        for anchor in anchors:
            if abs(len(token) - len(anchor)) > 2:
                continue
            if float(fuzz.ratio(token, anchor)) >= 85:
                return True
    return False


def _score_name_against_ocr(name: str, full: str, phrases: list[str]) -> float:
    """Score one catalog name against OCR phrases / full text."""
    name_cf = name.casefold().strip()
    ascii_letters = sum(1 for ch in name_cf if ch.isascii() and ch.isalpha())
    if ascii_letters < 3:
        return 0.0

    if name_cf in full:
        return 98.0

    compact_name = "".join(ch for ch in name_cf if ch.isalpha())
    compact_full = "".join(ch for ch in full if ch.isalpha())
    if len(compact_name) >= 4 and compact_name in compact_full:
        return 96.0

    distinctive = [w for w in _distinctive_name_words(name_cf) if len(w) >= 4]
    if not distinctive and ascii_letters >= 3:
        # Short names like ORS: keep compact form only.
        distinctive = [compact_name] if len(compact_name) >= 3 else []
    if not distinctive:
        return 0.0

    if all(word in full for word in distinctive):
        return 94.0

    best = 0.0
    # Only score single OCR tokens / short bigrams — not the whole noisy blob.
    for phrase in phrases:
        phrase_letters = "".join(ch for ch in phrase if ch.isalpha())
        word_count = len(phrase.split())
        if word_count > 2:
            # Multi-word lines: only exact / substring hits (already handled above).
            if name_cf in phrase or phrase in name_cf:
                best = max(best, 93.0)
            continue
        if len(phrase_letters) < 4 and len(compact_name) >= 5:
            continue
        if len(phrase_letters) < 3:
            continue

        if phrase == name_cf or phrase_letters == compact_name:
            return 100.0
        if name_cf in phrase or phrase in name_cf:
            best = max(best, 93.0)
            continue

        for target in distinctive:
            if phrase_letters == target:
                return 100.0
            # Near-exact token match only (OCR typos).
            if abs(len(phrase_letters) - len(target)) > 2:
                continue
            ratio = float(fuzz.ratio(phrase_letters, target))
            if ratio >= 88:
                best = max(best, ratio)
            elif (
                len(target) >= 6
                and phrase_letters[:4] == target[:4]
                and ratio >= 82
            ):
                best = max(best, ratio)
    return best


def match_ocr_text(
    ocr_text: str,
    *,
    limit: int = 5,
    min_score: float = _OCR_MIN_SCORE,
    form: str | None = None,
) -> list[tuple[float, Medicine]]:
    """
    Rank catalog medicines by scanning every OCR token / phrase against names.
    Optional form narrows the catalog (tablet, syrup, …).
    """
    full = " ".join(ocr_text.split()).casefold()
    phrases = _ocr_phrases(ocr_text)
    if not full or not phrases:
        return []

    _, _, medicines = _catalog()
    pool = _filter_by_form(medicines, form)
    scored: list[tuple[float, Medicine]] = []
    for medicine in pool:
        best = 0.0
        for name in medicine.names:
            best = max(best, _score_name_against_ocr(name, full, phrases))
        if best >= min_score:
            scored.append((best, medicine))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return scored[:limit]
