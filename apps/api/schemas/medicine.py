"""Medicine catalog schemas (aligned with data/medicines/)."""

from pydantic import BaseModel, ConfigDict, Field, field_validator

from schemas.common import ReviewedContentBase


class MedicineCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    namePs: str = Field(min_length=1)
    nameEn: str = Field(min_length=1)
    order: int = Field(ge=1)


class Medicine(ReviewedContentBase):
    """Full medicine document as stored in seed JSON / MongoDB."""

    id: str = Field(min_length=1)
    category: str = Field(min_length=1)
    names: list[str] = Field(min_length=1)
    usesPs: str = Field(min_length=1)
    usesEn: str = Field(min_length=1)
    warningsPs: str = Field(min_length=1)
    warningsEn: str = Field(min_length=1)

    @field_validator("names")
    @classmethod
    def _clean_names(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip() for item in values if item and item.strip()]
        if not cleaned:
            raise ValueError("names must include at least one non-empty spelling")
        return cleaned


class MedicineSummary(BaseModel):
    """Compact match result for search / OCR screens."""

    model_config = ConfigDict(extra="forbid")

    id: str
    category: str
    names: list[str]
    usesPs: str
    usesEn: str
    warningsPs: str
    warningsEn: str
    audioUrl: str | None = None
