from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    APP_NAME: str = "ResumeForge API"
    DEBUG: bool = False
    
    # LLM Proxy
    LLM_PROXY_URL: str = "https://llm-proxy.densematrix.ai"
    LLM_PROXY_KEY: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    
    # Creem Payment
    CREEM_API_KEY: str = ""
    CREEM_WEBHOOK_SECRET: str = ""
    CREEM_PRODUCT_IDS: str = "{}"
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]
    
    # Free tier limits
    FREE_DAILY_GENERATIONS: int = 5
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
