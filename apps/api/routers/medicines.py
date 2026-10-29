"""Medicine name search, forms list, and pack-photo OCR match endpoints."""

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from schemas.medicine import (
    Medicine,
    MedicineForm,
    MedicineOcrCandidate,
    MedicineOcrFormMismatch,
    MedicineOcrResponse,
    MedicineSummary,
)
from services import medicine_store
from services.ocr import OcrError, extract_text_from_image_bytes

router = APIRouter(tags=["medicines"])

_MAX_UPLOAD_BYTES = 8 * 1024 * 1024


def _to_ocr_candidates(
    ranked: list[tuple[float, Medicine]],
) -> list[MedicineOcrCandidate]:
    return [
        MedicineOcrCandidate(
            **medicine_store.to_summary(medicine).model_dump(),
            score=round(score, 1),
            confidence=medicine_store.confidence_for_score(score),
        )
        for score, medicine in ranked
    ]


def _filter_weak_ocr_hits(
    ranked: list[tuple[float, Medicine]],
    *,
    usable: bool,
    ocr_text: str,
) -> list[tuple[float, Medicine]]:
    if ranked and (
        not usable and not medicine_store.ocr_has_medicine_anchor(ocr_text)
    ):
        return [(score, med) for score, med in ranked if score >= 92]
    return ranked


def _form_mismatch_hint(
    *,
    selected_form: str,
    ranked_any: list[tuple[float, Medicine]],
) -> MedicineOcrFormMismatch | None:
    """Build a hint when OCR matches exist only outside the selected form."""
    if not ranked_any:
        return None
    suggested: list[str] = []
    names: list[str] = []
    seen_forms: set[str] = set()
    selected = selected_form.strip().casefold()
    for _score, medicine in ranked_any[:5]:
        display = next(
            (n for n in medicine.names if all(ord(c) < 128 for c in n)),
            medicine.names[0],
        )
        if display not in names:
            names.append(display)
        for form_id in medicine.forms:
            key = form_id.casefold()
            if key == selected or key in seen_forms:
                continue
            seen_forms.add(key)
            suggested.append(form_id)
    if not suggested or not names:
        return None
    return MedicineOcrFormMismatch(
        selectedForm=selected,
        suggestedForms=suggested[:4],
        matchedNames=names[:3],
    )


@router.get("/medicines/forms", response_model=list[MedicineForm])
async def list_medicine_forms() -> list[MedicineForm]:
    """Dosage forms for the medicine picker (tablet, syrup, …)."""
    try:
        return medicine_store.list_forms()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/medicines/search", response_model=list[MedicineSummary])
async def search_medicines(
    q: str = Query(
        ...,
        min_length=1,
        max_length=120,
        description="Medicine name spelling (English or local).",
    ),
    limit: int = Query(default=10, ge=1, le=25),
    form: str | None = Query(
        default=None,
        max_length=40,
        description="Optional dosage form filter (tablet, syrup, …).",
    ),
) -> list[MedicineSummary]:
    """Fuzzy-match curated medicine names and return ranked summaries."""
    try:
        return medicine_store.search_by_name(q, limit=limit, form=form)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/medicines/ocr", response_model=MedicineOcrResponse)
async def ocr_medicine_pack(
    image: UploadFile = File(..., description="Medicine pack photo (JPEG/PNG/WebP)"),
    limit: int = Query(default=5, ge=1, le=10),
    form: str | None = Query(
        default=None,
        max_length=40,
        description="Optional dosage form filter (tablet, syrup, …).",
    ),
) -> MedicineOcrResponse:
    """Extract all pack text with Tesseract, then match every token to the catalog."""
    data = await image.read(_MAX_UPLOAD_BYTES + 1)
    if len(data) > _MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image too large (max 8 MB)",
        )
    if not data:
        raise HTTPException(status_code=400, detail="Empty image upload")

    try:
        extracted = extract_text_from_image_bytes(
            data,
            content_type=image.content_type,
        )
    except OcrError as exc:
        message = str(exc)
        status = 503 if "Tesseract" in message else 400
        raise HTTPException(status_code=status, detail=message) from exc

    ocr_text = extracted.text.strip()
    if not ocr_text:
        return MedicineOcrResponse(ocrText="", candidates=[])

    try:
        ranked = medicine_store.match_ocr_text(
            ocr_text,
            limit=limit,
            form=form,
        )
        ranked_any: list[tuple[float, Medicine]] = []
        if not ranked and form:
            ranked_any = medicine_store.match_ocr_text(
                ocr_text,
                limit=limit,
                form=None,
            )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    ranked = _filter_weak_ocr_hits(
        ranked,
        usable=extracted.usable,
        ocr_text=ocr_text,
    )
    ranked_any = _filter_weak_ocr_hits(
        ranked_any,
        usable=extracted.usable,
        ocr_text=ocr_text,
    )

    if not ranked and not ranked_any and not extracted.usable:
        return MedicineOcrResponse(ocrText="", candidates=[])

    if not ranked:
        mismatch = (
            _form_mismatch_hint(selected_form=form, ranked_any=ranked_any)
            if form and ranked_any
            else None
        )
        return MedicineOcrResponse(
            ocrText=ocr_text,
            candidates=[],
            formMismatch=mismatch,
        )

    return MedicineOcrResponse(
        ocrText=ocr_text,
        candidates=_to_ocr_candidates(ranked),
    )
