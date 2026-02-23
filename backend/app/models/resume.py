from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class Resume(Base):
    """Resume data storage."""
    
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(255), index=True, nullable=False)
    title = Column(String(255), default="Untitled Resume")
    template_id = Column(String(50), default="modern")
    data = Column(JSON, default=dict)  # Full resume JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DailyUsage(Base):
    """Track daily free usage."""
    
    __tablename__ = "daily_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(255), index=True, nullable=False)
    date = Column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    generations_used = Column(Integer, default=0)
