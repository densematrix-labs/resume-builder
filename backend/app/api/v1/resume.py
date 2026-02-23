from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.services import llm_service, token_service
from app.metrics import (
    core_function_calls, tokens_consumed, free_trial_used
)

router = APIRouter(prefix="/resume", tags=["resume"])


class GenerateRequest(BaseModel):
    job_title: str
    section: str = "experience"  # experience, summary, skills, improve
    context: Optional[str] = ""
    language: str = "en"


class GenerateResponse(BaseModel):
    content: str
    tokens_remaining: int
    source: str  # "paid" or "free"


class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    resume_summary: str
    language: str = "en"


class TokenStatusResponse(BaseModel):
    tokens_remaining: int
    daily_used: int
    daily_limit: int
    can_generate: bool


@router.post("/generate", response_model=GenerateResponse)
async def generate_content(
    request: GenerateRequest,
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """Generate resume content using AI."""
    
    # Check if can generate
    can_gen, source = await token_service.can_generate(db, x_device_id)
    if not can_gen:
        raise HTTPException(
            status_code=402,
            detail="Daily free limit reached. Purchase tokens to continue."
        )
    
    # Generate content
    try:
        content = await llm_service.generate_resume_content(
            job_title=request.job_title,
            section=request.section,
            context=request.context or "",
            language=request.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
    
    # Consume token
    await token_service.use_generation(db, x_device_id)
    
    # Update metrics
    core_function_calls.labels(tool="resume-builder", function="generate").inc()
    if source == "paid":
        tokens_consumed.labels(tool="resume-builder").inc()
    else:
        free_trial_used.labels(tool="resume-builder").inc()
    
    # Get remaining tokens
    token = await token_service.get_or_create_token(db, x_device_id)
    
    return GenerateResponse(
        content=content,
        tokens_remaining=token.tokens_remaining,
        source=source
    )


@router.post("/cover-letter", response_model=GenerateResponse)
async def generate_cover_letter(
    request: CoverLetterRequest,
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """Generate cover letter using AI."""
    
    can_gen, source = await token_service.can_generate(db, x_device_id)
    if not can_gen:
        raise HTTPException(
            status_code=402,
            detail="Daily free limit reached. Purchase tokens to continue."
        )
    
    try:
        content = await llm_service.generate_cover_letter(
            job_title=request.job_title,
            company=request.company,
            resume_summary=request.resume_summary,
            language=request.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
    
    await token_service.use_generation(db, x_device_id)
    
    core_function_calls.labels(tool="resume-builder", function="cover_letter").inc()
    if source == "paid":
        tokens_consumed.labels(tool="resume-builder").inc()
    else:
        free_trial_used.labels(tool="resume-builder").inc()
    
    token = await token_service.get_or_create_token(db, x_device_id)
    
    return GenerateResponse(
        content=content,
        tokens_remaining=token.tokens_remaining,
        source=source
    )


@router.get("/tokens", response_model=TokenStatusResponse)
async def get_token_status(
    x_device_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """Get current token status for device."""
    from app.core.config import get_settings
    settings = get_settings()
    
    token = await token_service.get_or_create_token(db, x_device_id)
    daily_used = await token_service.get_daily_usage(db, x_device_id)
    can_gen, _ = await token_service.can_generate(db, x_device_id)
    
    return TokenStatusResponse(
        tokens_remaining=token.tokens_remaining,
        daily_used=daily_used,
        daily_limit=settings.FREE_DAILY_GENERATIONS,
        can_generate=can_gen
    )
