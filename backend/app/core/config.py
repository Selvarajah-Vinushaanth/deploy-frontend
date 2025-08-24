import os
from typing import Any, Dict, List, Optional, Union

from dotenv import load_dotenv

load_dotenv()


class Settings:
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")

    # Firebase settings
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_KEY_PATH", ""
    )

    # HuggingFace settings
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")
    LYRIC_GENERATOR_SPACE: str = os.getenv("LYRIC_GENERATOR_SPACE", "")
    METAPHOR_GENERATION_SPACE: str = os.getenv("METAPHOR_GENERATION_SPACE", "")
    METAPHOR_CLASSIFICATION_SPACE: str = os.getenv("METAPHOR_CLASSIFICATION_SPACE", "")

    # CORS settings
    CORS_ORIGINS: List[str] = eval(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]'))


settings = Settings()
