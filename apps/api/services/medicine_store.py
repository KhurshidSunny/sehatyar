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
        # WRatio for typos/brand spellings; partial/token for OCR noise.
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


def confidence_for_score(score: float) -> str:
    if score >= 85:
        return "high"
    if score >= 70:
        return "medium"
    return "low"


# Pack boilerplate — never treat these as a medicine identity match.
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
    }
)


def _ocr_tokens(ocr_text: str) -> list[str]:
    """Distinctive Latin tokens (skip generic pack words)."""
    cleaned = " ".join(ocr_text.split())
    tokens: list[str] = []
    for token in cleaned.replace("/", " ").replace("-", " ").split():
        letters = "".join(ch for ch in token if ch.isalpha()).casefold()
        if len(letters) < 5 or letters in _GENERIC_OCR_TOKENS:
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


def _distinctive_name_words(name_cf: str) -> list[str]:
    words = [w for w in name_cf.replace("-", " ").split() if len(w) >= 5]
    return [w for w in words if w not in _GENERIC_OCR_TOKENS]


def _catalog_name_anchors() -> frozenset[str]:
    """All distinctive Latin catalog name fragments (len >= 5)."""
    _, medicines = _catalog()
    anchors: set[str] = set()
    for medicine in medicines:
        for name in medicine.names:
            name_cf = name.casefold().strip()
            ascii_letters = sum(1 for ch in name_cf if ch.isascii() and ch.isalpha())
            if ascii_letters < 5:
                continue
            for word in _distinctive_name_words(name_cf):
                anchors.add(word)
            compact = "".join(ch for ch in name_cf if ch.isalpha())
            if len(compact) >= 5:
                anchors.add(compact)
    return frozenset(anchors)


def ocr_has_medicine_anchor(ocr_text: str) -> bool:
    """
    True when OCR contains a near-exact catalog name fragment.
    Blocks face / wall photos that invent random high-confidence words.
    """
    tokens = _ocr_tokens(ocr_text)
    if not tokens:
        return False
    anchors = _catalog_name_anchors()
    for token in tokens:
        if token in anchors:
            return True
        for anchor in anchors:
            if abs(len(token) - len(anchor)) > 1:
                continue
            if float(fuzz.ratio(token, anchor)) >= 92:
                return True
    return False


def _score_name_against_ocr(name: str, full: str, tokens: list[str]) -> float:
    """
    Strict score: only reward grounded evidence in the OCR text.
    Short aliases (ASA, ORS, H2O2) are ignored — they false-hit on noise.
    """
    name_cf = name.casefold().strip()
    ascii_letters = sum(1 for ch in name_cf if ch.isascii() and ch.isalpha())
    # Need a real brand / INN fragment, not a 3–4 letter abbreviation.
    if ascii_letters < 5:
        return 0.0

    if name_cf in full:
        return 96.0

    distinctive = [w for w in _distinctive_name_words(name_cf) if len(w) >= 5]
    if not distinctive:
        return 0.0

    if all(word in full for word in distinctive):
        return 94.0

    best = 0.0
    for token in tokens:
        if len(token) < 5:
            continue
        for target in distinctive:
            if token == target:
                return 100.0
            # Tiny OCR typos only (same length ±1, very high similarity).
            if abs(len(token) - len(target)) > 1:
                continue
            ratio = float(fuzz.ratio(token, target))
            if ratio >= 92:
                best = max(best, ratio)
            elif (
                len(target) >= 6
                and token[:5] == target[:5]
                and ratio >= 88
            ):
                best = max(best, ratio)
    return best


def match_ocr_text(
    ocr_text: str,
    *,
    limit: int = 5,
    min_score: float = 92.0,
) -> list[tuple[float, Medicine]]:
    """Rank catalog medicines only when OCR clearly supports a name."""
    full = " ".join(ocr_text.split()).casefold()
    tokens = _ocr_tokens(ocr_text)
    # Need at least one distinctive token (not just pack boilerplate).
    if not full or not tokens:
        return []

    _, medicines = _catalog()
    scored: list[tuple[float, Medicine]] = []
    for medicine in medicines:
        best = 0.0
        for name in medicine.names:
            best = max(best, _score_name_against_ocr(name, full, tokens))
        if best >= min_score:
            scored.append((best, medicine))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return scored[:limit]
