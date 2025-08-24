from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.firebase_auth import get_current_user
from app.models.schemas import UserProfile

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    try:
        return UserProfile(
            uid=current_user["uid"],
            email=current_user.get("email"),
            display_name=current_user["claims"].get("name")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )
