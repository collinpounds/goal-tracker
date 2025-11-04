from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .config import settings
from .routers import goals, health

app = FastAPI(title="Goal Tracker API", version="1.0.0")

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

    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Frontend not found. Build the frontend first."}
