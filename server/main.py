from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import model modules
from models.metaphor_creator import generate_metaphor
from models.metaphor_classifier import classify_metaphor
from models.lyric_generator import generate_lyrics_text

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
            count=5,  # Generate 5 metaphors instead of 3
            target=request.target
        )
        
        # Remove duplicates if any
        unique_metaphors = []
        for m in metaphors:
            if m not in unique_metaphors:
                unique_metaphors.append(m)
        
        return {"metaphors": unique_metaphors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating metaphors: {str(e)}")

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_metaphor(request: PredictionRequest):
    try:
        is_metaphor, confidence = classify_metaphor(request.text)
        return {"is_metaphor": is_metaphor, "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting metaphor: {str(e)}")

class LyricsRequest(BaseModel):
    motion: str
    seed: Optional[str] = ""

class LyricsResponse(BaseModel):
    lyrics: List[str]
    # suggestions: Optional[List[str]] = None

@app.post("/api/generate-lyrics", response_model=LyricsResponse)
async def create_lyrics(request: LyricsRequest):
    try:
        print(f"Received lyric request: Motion={request.motion}, Seed={request.seed}")

        # generate main lyric
        main_lyric = generate_lyrics_text(motion=request.motion, seed=request.seed)

        # generate 4 more lyrics (all considered as lyrics)
        more_lyrics = [generate_lyrics_text(motion=request.motion, seed="") for _ in range(2)]

        # combine all lyrics in a single list
        all_lyrics = [main_lyric] + more_lyrics

        print(f"Generated total {len(all_lyrics)} lyrics")
        return {"lyrics": all_lyrics}

    except Exception as e:
        print(f"Error generating lyrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating lyrics: {str(e)}")
@app.get("/")
async def root():
    return {"message": "Welcome to the Song Analysis API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
