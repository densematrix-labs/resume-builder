"""
Creem Payment Router for Resume Builder.
Based on creem-payment skill template.
"""
import hmac
import hashlib
import json
import httpx
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.config import get_settings
from app.core.database import get_db
from app.models.token import GenerationToken, PaymentTransaction
from app.services import token_service
from app.metrics import payment_success, payment_revenue

settings = get_settings()

# Product configuration
PRODUCTS = {
    "starter_30": {"price": 299, "generations": 30, "name": "Starter Pack"},
    "pro_100": {"price": 699, "generations": 100, "name": "Pro Pack"},
    "unlimited_monthly": {"price": 999, "generations": 999, "name": "Unlimited Monthly"},
}


def get_creem_api_base():
    """Use test API for test keys, production API for live keys."""
    if settings.CREEM_API_KEY.startswith("creem_test_"):
        return "https://test-api.creem.io/v1"
    return "https://api.creem.io/v1"


router = APIRouter(prefix="/payment", tags=["payment"])


class Product(BaseModel):
    sku: str
    name: str
    price_cents: int
    generations: int
    discount_percent: Optional[int] = None


class CreateCheckoutRequest(BaseModel):
    product_sku: str
    device_id: str
    success_url: str
    optional_email: Optional[str] = None


class CreateCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


@router.get("/products", response_model=list[Product])
async def get_products():
    """Get available product packages."""
    products = []
    for sku, info in PRODUCTS.items():
        discount = None
        if len(PRODUCTS) > 1:
            per_unit_prices = {k: v["price"] / v["generations"] for k, v in PRODUCTS.items()}
            max_per_unit = max(per_unit_prices.values())
            this_per_unit = per_unit_prices[sku]
            if this_per_unit < max_per_unit:
                discount = int(((max_per_unit - this_per_unit) / max_per_unit) * 100)
        
        products.append(Product(
            sku=sku,
            name=info["name"],
            price_cents=info["price"],
            generations=info["generations"],
            discount_percent=discount,
        ))
    return products


@router.post("/create-checkout", response_model=CreateCheckoutResponse)
async def create_checkout(
    request: CreateCheckoutRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a Creem checkout session."""
    if request.product_sku not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product SKU")
    
    # Parse product IDs from settings
    try:
        creem_product_ids = json.loads(settings.CREEM_PRODUCT_IDS) if settings.CREEM_PRODUCT_IDS else {}
    except:
        creem_product_ids = {}
    
    creem_product_id = creem_product_ids.get(request.product_sku)
    if not creem_product_id:
        raise HTTPException(status_code=400, detail="Product not configured in Creem")

    product = PRODUCTS[request.product_sku]

    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "product_id": creem_product_id,
                "success_url": request.success_url,
                "metadata": {
                    "product_sku": request.product_sku,
                    "device_id": request.device_id,
                    "generations": str(product["generations"]),
                },
            }
            if request.optional_email:
                payload["customer"] = {"email": request.optional_email}

            response = await client.post(
                f"{get_creem_api_base()}/checkouts",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": settings.CREEM_API_KEY,
                },
                json=payload,
                timeout=30.0,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Creem API error: {response.text}",
                )

            data = response.json()
            return CreateCheckoutResponse(
                checkout_url=data["checkout_url"],
                session_id=data["id"],
            )

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


def verify_creem_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Creem webhook signature using HMAC-SHA256."""
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


@router.post("/webhooks/creem")
async def creem_webhook(
    request: Request,
    creem_signature: str = Header(None, alias="creem-signature"),
    db: AsyncSession = Depends(get_db),
):
    """Handle Creem webhook events."""
    payload = await request.body()

    if settings.CREEM_WEBHOOK_SECRET:
        if not creem_signature or not verify_creem_signature(
            payload, creem_signature, settings.CREEM_WEBHOOK_SECRET
        ):
            raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = json.loads(payload.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("eventType")

    if event_type == "checkout.completed":
        await _handle_checkout_completed(event, db)

    return {"received": True}


async def _handle_checkout_completed(event: dict, db: AsyncSession):
    """Handle successful checkout — add tokens + record transaction."""
    obj = event.get("object", {})
    metadata = obj.get("metadata", {})
    order = obj.get("order", {})

    product_sku = metadata.get("product_sku")
    device_id = metadata.get("device_id")
    generations = int(metadata.get("generations", 1))
    amount_cents = order.get("amount", 0)

    # Add tokens to device
    await token_service.add_tokens(db, device_id, generations)

    # Record transaction
    transaction = PaymentTransaction(
        checkout_id=obj.get("id"),
        device_id=device_id,
        product_sku=product_sku,
        amount_cents=amount_cents,
        currency=order.get("currency", "USD"),
        status="completed",
        tokens_granted=generations,
        completed_at=datetime.utcnow(),
    )
    db.add(transaction)
    await db.commit()
    
    # Update metrics
    payment_success.labels(tool="resume-builder", product_sku=product_sku).inc()
    payment_revenue.labels(tool="resume-builder").inc(amount_cents)
