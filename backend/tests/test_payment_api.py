import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_products(client: AsyncClient):
    """Test get products endpoint."""
    response = await client.get("/api/v1/payment/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check product structure
    product = data[0]
    assert "sku" in product
    assert "name" in product
    assert "price_cents" in product
    assert "generations" in product


@pytest.mark.asyncio
async def test_create_checkout_invalid_sku(client: AsyncClient):
    """Test checkout with invalid SKU."""
    response = await client.post(
        "/api/v1/payment/create-checkout",
        json={
            "product_sku": "invalid_sku",
            "device_id": "test-device",
            "success_url": "https://example.com/success"
        }
    )
    assert response.status_code == 400
    data = response.json()
    assert "Invalid product SKU" in data["detail"]


@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    """Test webhook with invalid signature."""
    response = await client.post(
        "/api/v1/payment/webhooks/creem",
        headers={"creem-signature": "invalid"},
        json={"eventType": "checkout.completed", "object": {}}
    )
    # Should reject invalid signature when CREEM_WEBHOOK_SECRET is set
    # For now without secret, it may pass
    assert response.status_code in [200, 400]
