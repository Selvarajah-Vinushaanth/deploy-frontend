from typing import List, Optional
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Model for error responses."""
    detail: str


class UserProfile(BaseModel):
    """User profile model."""
    uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None


class LyricGenerationRequest(BaseModel):
    """Request model for lyric generation."""
    theme: str = Field(..., description="The theme or topic for the lyrics")
    mood: str = Field(..., description="The mood of the song (e.g., happy, sad, romantic)")
    length: int = Field(default=16, description="Number of lines to generate")
    style: Optional[str] = Field(None, description="Style of the lyrics (e.g., modern, classical)")
    include_metaphors: bool = Field(default=True, description="Whether to include metaphors")
    reference_text: Optional[str] = Field(None, description="Reference text for inspiration")


class LyricGenerationResponse(BaseModel):
    """Response model for generated lyrics."""
    lyrics: List[str] = Field(..., description="Generated lyrics as lines")
    metadata: dict = Field(default_factory=dict, description="Additional metadata about generation")


class MetaphorGenerationRequest(BaseModel):
    """Request model for metaphor generation."""
    source_concept: str = Field(..., description="Source concept for the metaphor")
    target_concept: str = Field(..., description="Target concept for the metaphor")
    count: int = Field(default=5, description="Number of metaphor suggestions to return")
    creativity_level: int = Field(default=2, description="Creativity level (1-3)")
    include_explanations: bool = Field(default=True, description="Whether to include explanations")


class MetaphorSuggestion(BaseModel):
    """Model for a single metaphor suggestion."""
    metaphor: str = Field(..., description="Suggested metaphor")
    score: float = Field(..., description="Relevance score")
    explanation: Optional[str] = Field(None, description="Explanation of the metaphor if requested")


class MetaphorGenerationResponse(BaseModel):
    """Response model for metaphor suggestions."""
    suggestions: List[MetaphorSuggestion] = Field(..., description="List of metaphor suggestions")
    source_concept: str = Field(..., description="Source concept used")
    target_concept: str = Field(..., description="Target concept used")


class MetaphorClassificationRequest(BaseModel):
    """Request model for metaphor classification."""
    text: str = Field(..., description="Text to analyze for metaphors")
    detailed: bool = Field(default=True, description="Whether to provide detailed analysis")
    include_context: bool = Field(default=True, description="Whether to include surrounding context")


class MetaphorInstance(BaseModel):
    """Model for a single identified metaphor."""
    id: str = Field(..., description="Unique identifier for the metaphor instance")
    text: str = Field(..., description="The metaphorical text")
    source_domain: str = Field(..., description="Source domain of the metaphor")
    target_domain: str = Field(..., description="Target domain of the metaphor")
    confidence: float = Field(..., description="Confidence score of the classification")
    explanation: Optional[str] = Field(None, description="Explanation of the metaphor")
    context: Optional[str] = Field(None, description="Surrounding context if requested")


class MetaphorClassificationResponse(BaseModel):
    """Response model for metaphor classification."""
    metaphors: List[MetaphorInstance] = Field(..., description="List of identified metaphors")
    overall_analysis: Optional[dict] = Field(None, description="Overall analysis of metaphor usage in the text")
