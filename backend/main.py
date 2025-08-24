import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router
from app.core.middleware import ErrorHandlerMiddleware, RequestLoggingMiddleware

def create_application() -> FastAPI:
    """Create the FastAPI application."""
    application = FastAPI(
        title="Tamil Songwriting Assistant API",
        description="API for Tamil songwriting assistance using ML models",
        version="1.0.0",
        docs_url=f"{settings.API_PREFIX}/docs",
        redoc_url=f"{settings.API_PREFIX}/redoc",
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
    )

    # Set up CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add custom middleware
    application.add_middleware(ErrorHandlerMiddleware)
    application.add_middleware(RequestLoggingMiddleware)

    # Include API router
    application.include_router(api_router, prefix=settings.API_PREFIX)

    return application


app = create_application()


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Welcome to Tamil Songwriting Assistant API. Go to /api/v1/docs for documentation."}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG,
    )
