"""
Resume Builder API — FastAPI Application
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api.v1 import api_router
from app.metrics import metrics_router, track_request

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Free AI Resume Builder - Kickresume Alternative",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Track request metrics."""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    await track_request(request, response, duration)
    return response


# Routers
app.include_router(api_router)
app.include_router(metrics_router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "resume-builder"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "ResumeForge API",
        "description": "Free AI Resume Builder - Kickresume Alternative",
        "version": "1.0.0",
        "docs": "/docs"
    }
