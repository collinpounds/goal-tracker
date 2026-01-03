"""
Application configuration using pydantic-settings.
"""
import os
from typing import List


class Settings:
    """Application settings."""

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # JWT Verification - RS256 with JWKS (recommended)
    # Get from: Supabase Dashboard -> Settings -> API -> JWT Settings -> JWKS URL
    SUPABASE_JWKS_URL: str = os.getenv("SUPABASE_JWKS_URL", "")

    # Legacy HS256 fallback (deprecated - migrate to JWKS)
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Get CORS origins based on environment."""
        if self.ENVIRONMENT == "production":
            return [
                "https://bnmdrvslwmuimlpkqqfq.supabase.co",
                # Add your production frontend URL here
            ]
        else:
            # Development and local
            return [
                "http://localhost:5173",  # Vite dev server
                "http://localhost:3000",  # Alternative React dev port
                "http://localhost:80",    # Docker frontend
                "http://localhost",
            ]


settings = Settings()
