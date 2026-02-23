from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.token import GenerationToken
from app.models.resume import DailyUsage
from app.core.config import get_settings

settings = get_settings()


async def get_or_create_token(db: AsyncSession, device_id: str) -> GenerationToken:
    """Get or create token record for device."""
    result = await db.execute(
        select(GenerationToken).where(GenerationToken.device_id == device_id)
    )
    token = result.scalar_one_or_none()
    
    if not token:
        token = GenerationToken(device_id=device_id, tokens_remaining=0)
        db.add(token)
        await db.commit()
        await db.refresh(token)
    
    return token


async def get_daily_usage(db: AsyncSession, device_id: str) -> int:
    """Get today's usage count for device."""
    today = date.today().isoformat()
    result = await db.execute(
        select(DailyUsage).where(
            DailyUsage.device_id == device_id,
            DailyUsage.date == today
        )
    )
    usage = result.scalar_one_or_none()
    return usage.generations_used if usage else 0


async def increment_daily_usage(db: AsyncSession, device_id: str) -> int:
    """Increment daily usage and return new count."""
    today = date.today().isoformat()
    result = await db.execute(
        select(DailyUsage).where(
            DailyUsage.device_id == device_id,
            DailyUsage.date == today
        )
    )
    usage = result.scalar_one_or_none()
    
    if usage:
        usage.generations_used += 1
    else:
        usage = DailyUsage(device_id=device_id, date=today, generations_used=1)
        db.add(usage)
    
    await db.commit()
    return usage.generations_used


async def can_generate(db: AsyncSession, device_id: str) -> tuple[bool, str]:
    """Check if device can generate content."""
    token = await get_or_create_token(db, device_id)
    
    # Check paid tokens first
    if token.tokens_remaining > 0:
        return True, "paid"
    
    # Check daily free limit
    daily_used = await get_daily_usage(db, device_id)
    if daily_used < settings.FREE_DAILY_GENERATIONS:
        return True, "free"
    
    return False, "exhausted"


async def use_generation(db: AsyncSession, device_id: str) -> bool:
    """Use one generation token. Returns True if successful."""
    token = await get_or_create_token(db, device_id)
    
    # Use paid token if available
    if token.tokens_remaining > 0:
        token.tokens_remaining -= 1
        await db.commit()
        return True
    
    # Use free tier
    daily_used = await get_daily_usage(db, device_id)
    if daily_used < settings.FREE_DAILY_GENERATIONS:
        await increment_daily_usage(db, device_id)
        return True
    
    return False


async def add_tokens(db: AsyncSession, device_id: str, amount: int) -> int:
    """Add tokens to device account. Returns new balance."""
    token = await get_or_create_token(db, device_id)
    token.tokens_remaining += amount
    token.total_purchased += amount
    await db.commit()
    return token.tokens_remaining
