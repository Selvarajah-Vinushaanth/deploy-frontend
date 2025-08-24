from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.firebase_auth import get_current_user
from app.models.schemas import (
    MetaphorGenerationRequest,
    MetaphorGenerationResponse,
    MetaphorSuggestion
)
from app.services.huggingface_service import MetaphorGenerationService

router = APIRouter(tags=["metaphors"])

metaphor_gen_service = MetaphorGenerationService()


@router.post("/generate", response_model=MetaphorGenerationResponse)
async def generate_metaphors(
    request: MetaphorGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate metaphors based on source and target concepts."""
    try:
        result = await metaphor_gen_service.generate_metaphors(
            source_concept=request.source_concept,
            target_concept=request.target_concept,
            count=request.count,
            creativity_level=request.creativity_level,
            include_explanations=request.include_explanations
        )
        
        suggestions = []
        for item in result.get("suggestions", []):
            suggestions.append(
                MetaphorSuggestion(
                    metaphor=item["metaphor"],
                    score=item["score"],
                    explanation=item.get("explanation")
                )
            )
        
        return MetaphorGenerationResponse(
            suggestions=suggestions,
            source_concept=request.source_concept,
            target_concept=request.target_concept
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate metaphors: {str(e)}"
        )
