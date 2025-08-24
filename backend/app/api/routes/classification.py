from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.firebase_auth import get_current_user
from app.models.schemas import (
    MetaphorClassificationRequest,
    MetaphorClassificationResponse,
    MetaphorInstance
)
from app.services.huggingface_service import MetaphorClassificationService

router = APIRouter(tags=["classification"])

metaphor_class_service = MetaphorClassificationService()


@router.post("/analyze", response_model=MetaphorClassificationResponse)
async def classify_metaphors(
    request: MetaphorClassificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Classify metaphors in Tamil text."""
    try:
        result = await metaphor_class_service.classify_metaphors(
            text=request.text,
            detailed=request.detailed,
            include_context=request.include_context
        )
        
        metaphors = []
        for item in result.get("metaphors", []):
            metaphors.append(
                MetaphorInstance(
                    id=item["id"],
                    text=item["text"],
                    source_domain=item["source_domain"],
                    target_domain=item["target_domain"],
                    confidence=item["confidence"],
                    explanation=item.get("explanation"),
                    context=item.get("context")
                )
            )
        
        return MetaphorClassificationResponse(
            metaphors=metaphors,
            overall_analysis=result.get("overall_analysis")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to classify metaphors: {str(e)}"
        )
