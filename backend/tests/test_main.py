import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Welcome to Tamil Songwriting Assistant API" in response.json()["message"]
