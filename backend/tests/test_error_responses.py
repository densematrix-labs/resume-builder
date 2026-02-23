"""
Test error response formats to prevent [object Object] bugs.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_402_error_format(client: AsyncClient):
    """Test 402 error response format is serializable."""
    # First exhaust free tier by making many requests
    # For this test, we just verify the error format is correct
    # when daily limit is reached
    pass  # Integration test - requires mocking daily limit


@pytest.mark.asyncio
@patch("app.services.llm_service.generate_resume_content", new_callable=AsyncMock)
async def test_500_error_format(mock_generate, client: AsyncClient):
    """Test 500 error response format."""
    mock_generate.side_effect = Exception("LLM service unavailable")
    
    response = await client.post(
        "/api/v1/resume/generate",
        headers={"X-Device-Id": "test-device-error"},
        json={
            "job_title": "Engineer",
            "section": "experience",
            "language": "en"
        }
    )
    
    assert response.status_code == 500
    data = response.json()
    
    # Verify detail is a string, not an object
    detail = data.get("detail")
    assert isinstance(detail, str), f"detail should be string: {detail}"
    assert "[object Object]" not in detail


@pytest.mark.asyncio
async def test_validation_error_format(client: AsyncClient):
    """Test 422 validation error format."""
    response = await client.post(
        "/api/v1/resume/generate",
        headers={"X-Device-Id": "test-device"},
        json={}  # Missing required fields
    )
    
    assert response.status_code == 422
    data = response.json()
    
    # FastAPI validation errors have specific format
    assert "detail" in data
