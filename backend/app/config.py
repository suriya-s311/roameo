"""
ROAMEO Backend Configuration
"""
import os
import re
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


def _sanitize_supabase_url(url: str) -> str:
    url = (url or "").strip()
    match = re.search(r"https://[a-zA-Z0-9-]+\.supabase\.co", url)
    if match:
        return match.group(0)
    return url.split("]")[0].strip()


def _sanitize_jwt_secret(secret: str) -> str:
    secret = (secret or "").strip()
    if "git add" in secret:
        parts = secret.split()
        for p in reversed(parts):
            if len(p) > 20:
                return p
    return secret


class Settings(BaseSettings):
    SUPABASE_URL: str = _sanitize_supabase_url(os.getenv("SUPABASE_URL", ""))
    SUPABASE_SERVICE_ROLE_KEY: str = (os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")).strip()
    SUPABASE_JWT_SECRET: str = _sanitize_jwt_secret(os.getenv("SUPABASE_JWT_SECRET", ""))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        env_file = ".env"


settings = Settings()

