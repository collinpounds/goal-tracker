"""
Health check and system endpoints.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get(
    "",
    summary="API root endpoint",
    response_description="API information and status",
    responses={
        200: {
            "description": "API is running",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Goal Tracker API",
                        "status": "running"
                    }
                }
            }
        }
    }
)
async def api_root():
    """
    Get basic API information.

    Returns basic information about the API and confirms it is running.
    This endpoint is useful for checking if the API is accessible.
    """
    return {"message": "Goal Tracker API", "status": "running"}


@router.get(
    "/health",
    summary="Health check endpoint",
    response_description="API health status",
    responses={
        200: {
            "description": "API is healthy",
            "content": {
                "application/json": {
                    "example": {"status": "healthy"}
                }
            }
        }
    }
)
async def health_check():
    """
    Check the health status of the API.

    This endpoint is used for monitoring and health checks.
    Returns a simple status indicating the API is operational.

    Typically used by:
    - Docker health checks
    - Load balancers
    - Monitoring systems
    - Uptime monitors
    """
    return {"status": "healthy"}
