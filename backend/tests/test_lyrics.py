import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
from fastapi import status

from main import app
from app.services.huggingface_service import LyricGeneratorService


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


@pytest.fixture
def mock_current_user():
    """Mock the current user dependency."""
    with patch("app.auth.firebase_auth.get_current_user") as mock:
        mock.return_value = {"uid": "test_uid", "email": "test@example.com", "claims": {"name": "Test User"}}
        yield mock


@pytest.fixture
def mock_lyric_service():
    """Mock the lyric generation service."""
    with patch("app.api.routes.lyrics.lyric_service") as mock:
        mock.generate_lyrics = AsyncMock()
        mock.generate_lyrics.return_value = {
            "lyrics": ["Line 1", "Line 2", "Line 3"],
            "metadata": {"model": "test-model", "generation_time": 1.5}
        }
        yield mock


def test_generate_lyrics(client, mock_current_user, mock_lyric_service):
    """Test lyric generation endpoint."""
    response = client.post(
        "/api/v1/lyrics/generate",
        json={
            "theme": "love",
            "mood": "happy",
            "length": 3,
            "include_metaphors": True
        },
        headers={"Authorization": "Bearer fake_token"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "lyrics" in data
    assert len(data["lyrics"]) == 3
    assert "metadata" in data
    
    mock_lyric_service.generate_lyrics.assert_called_once_with(
        theme="love",
        mood="happy",
        length=3,
        style=None,
        include_metaphors=True,
        reference_text=None
    )
