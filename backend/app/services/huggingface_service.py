import json
from typing import Any, Dict, List, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings


class HuggingFaceSpaceService:
    """Service to interact with Hugging Face Spaces."""

    def __init__(self, api_token: Optional[str] = None):
        """Initialize the service.
        
        Args:
            api_token: Optional API token for authenticated requests
        """
        self.api_token = api_token or settings.HUGGINGFACE_API_TOKEN
        self.headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def query_space(
        self, space_name: str, payload: Dict[str, Any], timeout: int = 60
    ) -> Dict[str, Any]:
        """Query a Hugging Face space.
        
        Args:
            space_name: Name of the Hugging Face space
            payload: Data to send to the space
            timeout: Timeout in seconds
            
        Returns:
            Dict[str, Any]: Response from the space
            
        Raises:
            HTTPException: If the request fails
        """
        url = f"https://api-inference.huggingface.co/models/{space_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                json=payload, 
                headers=self.headers,
                timeout=timeout
            )
            
            if response.status_code != 200:
                error_detail = response.text
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_detail = error_json["error"]
                except:
                    pass
                    
                raise Exception(f"Error from HuggingFace space: {error_detail}")
            
            return response.json()


class LyricGeneratorService(HuggingFaceSpaceService):
    """Service to generate Tamil lyrics."""
    
    async def generate_lyrics(self, theme: str, mood: str, length: int = 16, 
                            style: Optional[str] = None, include_metaphors: bool = True,
                            reference_text: Optional[str] = None) -> Dict[str, Any]:
        """Generate Tamil lyrics based on theme and mood.
        
        Args:
            theme: Theme or topic for the lyrics
            mood: Mood of the song
            length: Number of lines to generate
            style: Style of lyrics (modern, classical, etc.)
            include_metaphors: Whether to include metaphors
            reference_text: Optional reference text for inspiration
            
        Returns:
            Dict[str, Any]: Generated lyrics and metadata
        """
        payload = {
            "theme": theme,
            "mood": mood,
            "length": length,
            "include_metaphors": include_metaphors
        }
        
        if style:
            payload["style"] = style
            
        if reference_text:
            payload["reference_text"] = reference_text
            
        return await self.query_space(settings.LYRIC_GENERATOR_SPACE, payload)


class MetaphorGenerationService(HuggingFaceSpaceService):
    """Service to generate metaphors for Tamil songwriting."""
    
    async def generate_metaphors(self, source_concept: str, target_concept: str, count: int = 5,
                             creativity_level: int = 2, include_explanations: bool = True) -> Dict[str, Any]:
        """Generate metaphors based on source and target concepts.
        
        Args:
            source_concept: Source concept for the metaphor
            target_concept: Target concept for the metaphor
            count: Number of metaphor suggestions to return
            creativity_level: Creativity level (1-3)
            include_explanations: Whether to include explanations
            
        Returns:
            Dict[str, Any]: Metaphor suggestions and metadata
        """
        payload = {
            "source_concept": source_concept,
            "target_concept": target_concept,
            "count": count,
            "creativity_level": creativity_level,
            "include_explanations": include_explanations
        }
        
        return await self.query_space(settings.METAPHOR_GENERATION_SPACE, payload)


class MetaphorClassificationService(HuggingFaceSpaceService):
    """Service to classify metaphors in Tamil text."""
    
    async def classify_metaphors(self, text: str, detailed: bool = True, include_context: bool = True) -> Dict[str, Any]:
        """Classify metaphors in Tamil text.
        
        Args:
            text: Text to analyze for metaphors
            detailed: Whether to provide detailed analysis
            include_context: Whether to include surrounding context
            
        Returns:
            Dict[str, Any]: Identified metaphors and analysis
        """
        payload = {
            "text": text,
            "detailed": detailed,
            "include_context": include_context
        }
            
        return await self.query_space(settings.METAPHOR_CLASSIFICATION_SPACE, payload)
