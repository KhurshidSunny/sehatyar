"""FAQ intent prediction endpoint."""

from fastapi import APIRouter, HTTPException, Query

from schemas.intent import IntentCandidate, IntentPredictRequest, IntentPredictResponse
from services import intent as intent_service

router = APIRouter(tags=["intent"])


@router.post("/predict-intent", response_model=IntentPredictResponse)
async def predict_intent(
    body: IntentPredictRequest,
    top_k: int = Query(default=3, ge=1, le=10),
) -> IntentPredictResponse:
    """Rank curated FAQ ids for a short Pashto (or mixed) text query."""
    try:
        hits, model_name = intent_service.predict(body.text, top_k=top_k)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not hits:
        raise HTTPException(status_code=503, detail="Intent model returned no labels")

    top = hits[0]
    return IntentPredictResponse(
        text=body.text.strip(),
        faqId=top.faq_id,
        category=top.category,
        score=top.score,
        candidates=[
            IntentCandidate(faqId=h.faq_id, category=h.category, score=h.score)
            for h in hits
        ],
        model=model_name,
    )
