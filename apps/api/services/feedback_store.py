"""Persist anonymous helpfulness votes in MongoDB."""

from __future__ import annotations

from datetime import datetime, timezone

from db import get_db
from schemas.feedback import FeedbackCreate, FeedbackRecord

COLLECTION = "feedback"


async def create_feedback(payload: FeedbackCreate) -> FeedbackRecord:
    """Insert one feedback document and return the stored record."""
    created_at = datetime.now(timezone.utc)
    document = {
        "targetType": payload.targetType,
        "targetId": payload.targetId,
        "helpful": payload.helpful,
        "createdAt": created_at,
    }
    result = await get_db()[COLLECTION].insert_one(document)
    return FeedbackRecord(
        id=str(result.inserted_id),
        targetType=payload.targetType,
        targetId=payload.targetId,
        helpful=payload.helpful,
        createdAt=created_at,
    )
