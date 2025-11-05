"""
Supabase client configuration and initialization.
"""
import os
from supabase import create_client, Client
from typing import Optional

# Supabase configuration
SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
# Use SERVICE_ROLE_KEY for backend operations to bypass RLS
# The backend has already verified the user's JWT, so it's safe to bypass RLS
SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate configuration
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
        "environment variables."
    )

# Create Supabase client with service role key (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> Client:
    """
    Dependency function to get Supabase client.
    Use this in FastAPI endpoints with Depends().
    """
    return supabase
