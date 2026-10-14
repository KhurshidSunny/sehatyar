"""Anonymous helpfulness feedback endpoint."""

from fastapi import APIRouter, HTTPException, status

from schemas.feedback import FeedbackCreate, FeedbackRecord
from services import faq_store, feedback_store, medicine_store

router = APIRouter(tags=["feedback"])


def _ensure_target_exists(target_type: str, target_id: str) -> None:
    """Reject votes for unknown FAQ or medicine ids."""
    try:
        if target_type == "faq":
            faq_store.get_faq(target_id)
        else:
            medicine_store.get_medicine(target_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown {target_type} id: {target_id}",
        ) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post(
    "/feedback",
    response_model=FeedbackRecord,
    status_code=status.HTTP_201_CREATED,
)
async def post_feedback(payload: FeedbackCreate) -> FeedbackRecord:
    """Store a yes/no helpfulness vote for an FAQ or medicine answer."""
    _ensure_target_exists(payload.targetType, payload.targetId)
    try:
        return await feedback_store.create_feedback(payload)
    except Exception as exc:  # noqa: BLE001 — surface Mongo failures clearly
        raise HTTPException(
            status_code=503,
            detail=f"Could not store feedback: {exc}",
        ) from exc
