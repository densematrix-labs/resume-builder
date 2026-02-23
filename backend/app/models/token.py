from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class GenerationToken(Base):
    """Tracks generation tokens for users."""
    
    __tablename__ = "generation_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(255), unique=True, index=True, nullable=False)
    tokens_remaining = Column(Integer, default=0)
    total_purchased = Column(Integer, default=0)
    free_trial_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PaymentTransaction(Base):
    """Payment transaction records."""
    
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    checkout_id = Column(String(255), unique=True, index=True)
    device_id = Column(String(255), index=True)
    product_sku = Column(String(100))
    amount_cents = Column(Integer)
    currency = Column(String(3), default="USD")
    status = Column(String(50), default="pending")
    tokens_granted = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
