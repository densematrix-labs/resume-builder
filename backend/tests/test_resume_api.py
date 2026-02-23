import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_get_token_status(client: AsyncClient):
    """Test token status endpoint."""
    response = await client.get(
        "/api/v1/resume/tokens",
        headers={"X-Device-Id": "test-device-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "tokens_remaining" in data
    assert "daily_used" in data
    assert "daily_limit" in data
    assert "can_generate" in data


@pytest.mark.asyncio
async def test_get_token_status_missing_device_id(client: AsyncClient):
    """Test token status endpoint without device ID."""
    response = await client.get("/api/v1/resume/tokens")
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_generate_content_requires_device_id(client: AsyncClient):
    """Test generate endpoint requires device ID."""
    response = await client.post(
        "/api/v1/resume/generate",
        json={"job_title": "Engineer", "section": "experience", "language": "en"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_generate_content_validates_input(client: AsyncClient):
    """Test generate endpoint validates input."""
    response = await client.post(
        "/api/v1/resume/generate",
        headers={"X-Device-Id": "test-device"},
        json={}  # Missing required fields
    )
    assert response.status_code == 422


@pytest.mark.asyncio
@patch("app.services.llm_service.generate_resume_content", new_callable=AsyncMock)
async def test_generate_content_success(mock_generate, client: AsyncClient):
    """Test successful content generation."""
    mock_generate.return_value = "• Achieved 20% improvement in metrics"
    
    response = await client.post(
        "/api/v1/resume/generate",
        headers={"X-Device-Id": "test-device-success"},
        json={
            "job_title": "Software Engineer",
            "section": "experience",
            "language": "en"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "tokens_remaining" in data
    assert "source" in data


@pytest.mark.asyncio
@patch("app.services.llm_service.generate_cover_letter", new_callable=AsyncMock)
async def test_generate_cover_letter(mock_generate, client: AsyncClient):
    """Test cover letter generation."""
    mock_generate.return_value = "Dear Hiring Manager..."
    
    response = await client.post(
        "/api/v1/resume/cover-letter",
        headers={"X-Device-Id": "test-device-cover"},
        json={
            "job_title": "Engineer",
            "company": "Tech Corp",
            "resume_summary": "Experienced engineer...",
            "language": "en"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
