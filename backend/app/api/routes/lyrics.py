from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.firebase_auth import get_current_user
from app.models.schemas import (
    LyricGenerationRequest, 
    LyricGenerationResponse
)
from app.services.huggingface_service import LyricGeneratorService

router = APIRouter(tags=["lyrics"])

lyric_service = LyricGeneratorService()


@router.post("/generate", response_model=LyricGenerationResponse)
async def generate_lyrics(
    request: LyricGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate Tamil lyrics based on the provided parameters."""
    try:
        result = await lyric_service.generate_lyrics(
            theme=request.theme,
            mood=request.mood,
            length=request.length,
            style=request.style,
            include_metaphors=request.include_metaphors,
            reference_text=request.reference_text
        )
        
        return LyricGenerationResponse(
            lyrics=result["lyrics"],
            metadata=result.get("metadata", {})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lyrics: {str(e)}"
        )
