"""FAQ category and entry schemas (aligned with data/faqs/)."""

from pydantic import BaseModel, ConfigDict, Field, field_validator

from schemas.common import DangerLevel, ReviewedContentBase


class FaqCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    namePs: str = Field(min_length=1)
    nameEn: str = Field(min_length=1)
    order: int = Field(ge=1)


class Faq(ReviewedContentBase):
    """Full FAQ document as stored in seed JSON / MongoDB."""

    id: str = Field(min_length=1)
    category: str = Field(min_length=1)
    questionPs: str = Field(min_length=1)
    questionEn: str = Field(min_length=1)
    answerPs: str = Field(min_length=1)
    answerEn: str = Field(min_length=1)
    paraphrasesPs: list[str] = Field(default_factory=list)
    dangerLevel: DangerLevel

    @field_validator("paraphrasesPs")
    @classmethod
    def _non_empty_paraphrases(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip() for item in values if item and item.strip()]
        return cleaned


class FaqSummary(BaseModel):
    """List-row shape for category browse screens."""

    model_config = ConfigDict(extra="forbid")

    id: str
    category: str
    questionPs: str
    questionEn: str
    dangerLevel: DangerLevel
    audioUrl: str | None = None
