"""Medicine name search endpoint."""

from fastapi import APIRouter, HTTPException, Query

from schemas.medicine import MedicineSummary
from services import medicine_store

router = APIRouter(tags=["medicines"])


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
