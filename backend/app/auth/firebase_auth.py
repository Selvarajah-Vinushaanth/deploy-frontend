import os
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

# Initialize Firebase Admin SDK
cred = None
if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_KEY_PATH):
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
    
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    # App already initialized
    pass

security = HTTPBearer()

class FirebaseAuth:
    """Firebase authentication dependency."""

    async def __call__(
        self, credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> dict:
        """
        Verify Firebase token and return user info.
        
        Args:
            credentials: The HTTP Authorization credentials.
            
        Returns:
            dict: User information.
            
        Raises:
            HTTPException: If authentication fails.
        """
        if credentials.scheme != "Bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme.",
            )
        
        token = credentials.credentials
        try:
            decoded_token = auth.verify_id_token(token)
            return {"uid": decoded_token["uid"], "email": decoded_token.get("email"), "claims": decoded_token}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials. {str(e)}",
            )


# Dependency for protected routes
get_current_user = FirebaseAuth()
