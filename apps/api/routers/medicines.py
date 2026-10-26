"""Medicine name search, forms list, and pack-photo OCR match endpoints."""

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from schemas.medicine import (
    MedicineForm,
    MedicineOcrCandidate,
    MedicineOcrResponse,
    MedicineSummary,
)
from services import medicine_store
from services.ocr import OcrError, extract_text_from_image_bytes

router = APIRouter(tags=["medicines"])

_MAX_UPLOAD_BYTES = 8 * 1024 * 1024


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
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    # Weak / non-pack photos: only keep hits that look like a real name anchor.
    if ranked and (
        not extracted.usable
        and not medicine_store.ocr_has_medicine_anchor(ocr_text)
    ):
        ranked = [(score, med) for score, med in ranked if score >= 92]

    if not ranked and not extracted.usable:
        return MedicineOcrResponse(ocrText="", candidates=[])

    if not ranked:
        return MedicineOcrResponse(ocrText=ocr_text, candidates=[])

    candidates = [
        MedicineOcrCandidate(
            **medicine_store.to_summary(medicine).model_dump(),
            score=round(score, 1),
            confidence=medicine_store.confidence_for_score(score),
        )
        for score, medicine in ranked
    ]
    return MedicineOcrResponse(ocrText=ocr_text, candidates=candidates)
