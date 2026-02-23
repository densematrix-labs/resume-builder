import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services import token_service


@pytest.mark.asyncio
async def test_get_or_create_token(db_session: AsyncSession):
    """Test token creation for new device."""
    device_id = "new-device-123"
    
    token = await token_service.get_or_create_token(db_session, device_id)
    
    assert token is not None
    assert token.device_id == device_id
    assert token.tokens_remaining == 0


@pytest.mark.asyncio
async def test_get_existing_token(db_session: AsyncSession):
    """Test getting existing token."""
    device_id = "existing-device"
    
    # Create first
    token1 = await token_service.get_or_create_token(db_session, device_id)
    
    # Get again
    token2 = await token_service.get_or_create_token(db_session, device_id)
    
    assert token1.id == token2.id


@pytest.mark.asyncio
async def test_daily_usage_tracking(db_session: AsyncSession):
    """Test daily usage tracking."""
    device_id = "usage-device"
    
    # Initial usage should be 0
    usage = await token_service.get_daily_usage(db_session, device_id)
    assert usage == 0
    
    # Increment
    new_usage = await token_service.increment_daily_usage(db_session, device_id)
    assert new_usage == 1
    
    # Check again
    usage = await token_service.get_daily_usage(db_session, device_id)
    assert usage == 1


@pytest.mark.asyncio
async def test_can_generate_free_tier(db_session: AsyncSession):
    """Test can_generate for free tier."""
    device_id = "free-tier-device"
    
    can_gen, source = await token_service.can_generate(db_session, device_id)
    
    assert can_gen is True
    assert source == "free"


@pytest.mark.asyncio
async def test_add_tokens(db_session: AsyncSession):
    """Test adding tokens to device."""
    device_id = "add-tokens-device"
    
    # Add tokens
    balance = await token_service.add_tokens(db_session, device_id, 50)
    
    assert balance == 50
    
    # Verify
    token = await token_service.get_or_create_token(db_session, device_id)
    assert token.tokens_remaining == 50
    assert token.total_purchased == 50


@pytest.mark.asyncio
async def test_use_generation_paid(db_session: AsyncSession):
    """Test using paid token."""
    device_id = "paid-device"
    
    # Add tokens first
    await token_service.add_tokens(db_session, device_id, 10)
    
    # Use one
    success = await token_service.use_generation(db_session, device_id)
    assert success is True
    
    # Check balance
    token = await token_service.get_or_create_token(db_session, device_id)
    assert token.tokens_remaining == 9


@pytest.mark.asyncio
async def test_use_generation_free(db_session: AsyncSession):
    """Test using free tier generation."""
    device_id = "free-use-device"
    
    # Use generation (should use free tier)
    success = await token_service.use_generation(db_session, device_id)
    assert success is True
    
    # Check daily usage
    usage = await token_service.get_daily_usage(db_session, device_id)
    assert usage == 1
