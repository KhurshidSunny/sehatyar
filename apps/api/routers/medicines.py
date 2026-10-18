"""Medicine name search and pack-photo OCR match endpoints."""

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from schemas.medicine import (
    MedicineOcrCandidate,
    MedicineOcrResponse,
    MedicineSummary,
)
from services import medicine_store
from services.ocr import OcrError, extract_text_from_image_bytes

router = APIRouter(tags=["medicines"])

_MAX_UPLOAD_BYTES = 8 * 1024 * 1024


@router.get("/medicines/search", response_model=list[MedicineSummary])
async def search_medicines(
    q: str = Query(
        ...,
        min_length=1,
        max_length=120,
        description="Medicine name spelling (English or local).",
    ),
    limit: int = Query(default=10, ge=1, le=25),
) -> list[MedicineSummary]:
    """Fuzzy-match curated medicine names and return ranked summaries."""
    try:
        return medicine_store.search_by_name(q, limit=limit)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/medicines/ocr", response_model=MedicineOcrResponse)
async def ocr_medicine_pack(
    image: UploadFile = File(..., description="Medicine pack photo (JPEG/PNG/WebP)"),
    limit: int = Query(default=5, ge=1, le=10),
) -> MedicineOcrResponse:
    """Extract pack text with Tesseract, then fuzzy-match the curated catalog."""
    data = await image.read(_MAX_UPLOAD_BYTES + 1)
    if len(data) > _MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image too large (max 8 MB)",
        )
    if not data:
        raise HTTPException(status_code=400, detail="Empty image upload")

    try:
        ocr_text = extract_text_from_image_bytes(
            data,
            content_type=image.content_type,
        )
    except OcrError as exc:
        message = str(exc)
        status = 503 if "Tesseract" in message else 400
        raise HTTPException(status_code=status, detail=message) from exc

    try:
        ranked = medicine_store.match_ocr_text(ocr_text, limit=limit)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    candidates = [
        MedicineOcrCandidate(
            **medicine_store.to_summary(medicine).model_dump(),
            score=round(score, 1),
            confidence=medicine_store.confidence_for_score(score),
        )
        for score, medicine in ranked
    ]
    return MedicineOcrResponse(ocrText=ocr_text, candidates=candidates)
