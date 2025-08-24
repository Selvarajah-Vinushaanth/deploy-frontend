from fastapi import APIRouter

from app.api.routes import lyrics, metaphors, classification, users

router = APIRouter()

router.include_router(lyrics.router, prefix="/lyrics")
router.include_router(metaphors.router, prefix="/metaphors")
router.include_router(classification.router, prefix="/classification")
router.include_router(users.router, prefix="/users")

# Add health check endpoint
@router.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
