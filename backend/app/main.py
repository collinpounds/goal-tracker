from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .config import settings
from .routers import goals, health, teams

app = FastAPI(
    title="Goal Tracker API",
    version="1.0.0",
    description="""
## Goal Tracker REST API

A modern, production-ready API for managing personal and professional goals.

### Features

* **Create Goals**: Add new goals with title, description, status, and target dates
* **Track Progress**: Update goal status (pending, in_progress, completed)
* **Manage Goals**: Update and delete goals as needed
* **Real-time Data**: All changes immediately reflected in the database

### Authentication

Currently, this API does not require authentication. For production use, implement proper authentication and authorization.

### Rate Limiting

No rate limiting is currently enforced. Consider implementing rate limiting for production deployments.

### Database

This API uses Supabase (PostgreSQL) for data persistence. All timestamps are stored in UTC with timezone information.
    """,
    contact={
        "name": "Goal Tracker Support",
        "url": "https://github.com/yourusername/goal-tracker",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "goals",
            "description": "Operations for managing goals. Goals are the core resource of this API, representing objectives with deadlines and status tracking.",
        },
        {
            "name": "teams",
            "description": "Operations for managing teams, team members, invitations, and team goals. Teams enable collaborative goal tracking.",
        },
        {
            "name": "health",
            "description": "System health and status endpoints. Use these to monitor the API and database connectivity.",
        },
    ],
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint at root (for Docker healthcheck)
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(goals.router, prefix="/api", tags=["goals"])
app.include_router(teams.router, prefix="/api", tags=["teams"])

# Mount static files (frontend dist folder)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")


# Serve frontend for all other routes (SPA fallback)
# This MUST be last as it catches all routes
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the React frontend for all non-API routes."""
    # Don't serve frontend for API routes
    if full_path.startswith("api/") or full_path.startswith("health"):
        return {"message": "Not found"}

    # Serve static files from root (like version.json)
    static_file = static_dir / full_path
    if static_file.exists() and static_file.is_file():
        return FileResponse(str(static_file))

    # Otherwise, serve the SPA index.html
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Frontend not found. Build the frontend first."}
