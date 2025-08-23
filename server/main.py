from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import model modules
from models.metaphor_creator import generate_metaphor
from models.metaphor_classifier import classify_metaphor
from models.lyric_generator import generate_lyrics

app = FastAPI(title="Song Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request/response data
class MetaphorRequest(BaseModel):
    source: str
    target: str
    emotion: Optional[str] = "positive"

class MetaphorResponse(BaseModel):
    metaphors: List[str]
    
class PredictionRequest(BaseModel):
    text: str
    
class PredictionResponse(BaseModel):
    is_metaphor: bool
    confidence: float
    
class LyricsRequest(BaseModel):
    theme: str
    style: Optional[str] = "pop"
    length: Optional[str] = "medium"  # Changed to str to accept "short", "medium", "long"
    seed: Optional[str] = ""
    
class LyricsResponse(BaseModel):
    lyrics: str

# API Routes
@app.post("/api/create-metaphors", response_model=MetaphorResponse)
async def create_metaphors(request: MetaphorRequest):
    try:
        # Map emotion to style for the generate_metaphor function
        style_map = {
            "positive": "romantic",
            "negative": "dark",
            "neutral": "general"
        }
        style = style_map.get(request.emotion, "general")
        
        # Generate metaphors using source as topic, and target for context
        metaphors = generate_metaphor(
            topic=request.source, 
            style=style, 
            count=3,
            target=request.target
        )
        return {"metaphors": metaphors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating metaphors: {str(e)}")

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_metaphor(request: PredictionRequest):
    try:
        is_metaphor, confidence = classify_metaphor(request.text)
        return {"is_metaphor": is_metaphor, "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting metaphor: {str(e)}")

@app.post("/api/generate-lyrics", response_model=LyricsResponse)
async def create_lyrics(request: LyricsRequest):
    try:
        # Map length strings to actual numbers
        length_map = {
            "short": 1,
            "medium": 2,
            "long": 3
        }
        
        # Convert length string to int, or use default if not recognized
        if isinstance(request.length, str):
            verses = length_map.get(request.length.lower(), 2)  # Default to medium (2) if not recognized
        else:
            verses = 2  # Default to medium if not a string
        print("reached")
        lyrics = generate_lyrics(
            theme=request.theme, 
            style=request.style, 
            length=verses,
            seed=request.seed
        )
        return {"lyrics": lyrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lyrics: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the Song Analysis API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
