"""FAQ category list, filtered question list, and detail endpoints."""

from fastapi import APIRouter, HTTPException, Query

from schemas.faq import Faq, FaqCategory, FaqSummary
from services import faq_store

router = APIRouter(tags=["faqs"])


@router.get("/categories", response_model=list[FaqCategory])
async def get_categories() -> list[FaqCategory]:
    """Return FAQ categories in display order."""
    try:
        return faq_store.list_categories()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/faqs", response_model=list[FaqSummary])
async def get_faqs(
    category: str | None = Query(
        default=None,
        description="Category id from /categories. Omit to list all FAQs.",
    ),
) -> list[FaqSummary]:
    """Return FAQ summaries, optionally filtered by category."""
    try:
        faqs = faq_store.list_faqs(category=category)
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown category: {category}",
        ) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return [faq_store.to_summary(faq) for faq in faqs]


@router.get("/faqs/{faq_id}", response_model=Faq)
async def get_faq_detail(faq_id: str) -> Faq:
    """Return one FAQ with full answer text and review metadata."""
    try:
        return faq_store.get_faq(faq_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"FAQ not found: {faq_id}") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
