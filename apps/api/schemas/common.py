"""Shared field types for FAQ and medicine content."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

DangerLevel = Literal["info", "clinic", "emergency"]
ReviewStatus = Literal["draft", "reviewed"]


class ContentSource(BaseModel):
    """Reference used to draft or check an entry."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1)
    url: str | None = None


def parse_reviewed_date(value: date | str) -> date:
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


class ReviewedContentBase(BaseModel):
    """Fields shared by FAQ and medicine catalog entries."""

    model_config = ConfigDict(extra="forbid")

    audioUrl: str | None = None
    source: ContentSource
    lastReviewed: date
    reviewStatus: ReviewStatus

    @field_validator("lastReviewed", mode="before")
    @classmethod
    def _coerce_last_reviewed(cls, value: date | str) -> date:
        return parse_reviewed_date(value)
