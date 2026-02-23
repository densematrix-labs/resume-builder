from fastapi import APIRouter
from app.api.v1 import resume, payment

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(resume.router)
api_router.include_router(payment.router)
