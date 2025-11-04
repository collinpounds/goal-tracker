"""
Health check and system endpoints.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def api_root():
    """API root endpoint."""
    return {"message": "Goal Tracker API", "status": "running"}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
