"""FAQ intent prediction request and response schemas."""

from pydantic import BaseModel, ConfigDict, Field


class IntentPredictRequest(BaseModel):
    """POST /predict-intent body."""

    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=500)


class IntentCandidate(BaseModel):
    """One ranked FAQ match with a probability score."""

    model_config = ConfigDict(extra="forbid")

    faqId: str
    category: str
    score: float = Field(ge=0.0, le=1.0)


class IntentPredictResponse(BaseModel):
    """Top FAQ intent plus optional shortlist of alternatives."""

    model_config = ConfigDict(extra="forbid")

    text: str
    faqId: str
    category: str
    score: float = Field(ge=0.0, le=1.0)
    candidates: list[IntentCandidate]
    model: str
