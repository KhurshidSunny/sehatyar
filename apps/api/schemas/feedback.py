"""Anonymous helpfulness feedback (no personal identity)."""

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

FeedbackTargetType = Literal["faq", "medicine"]


class FeedbackCreate(BaseModel):
    """Body for POST /feedback."""

    model_config = ConfigDict(extra="forbid")

    targetType: FeedbackTargetType
    targetId: str = Field(min_length=1)
    helpful: bool

    @field_validator("targetId")
    @classmethod
    def _strip_target_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("targetId must not be empty")
        return cleaned


class FeedbackRecord(FeedbackCreate):
    """Stored feedback document returned after insert."""

    id: str = Field(min_length=1)
    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
