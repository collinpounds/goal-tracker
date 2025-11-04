from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import Client
from pathlib import Path

from . import models, crud
from .supabase_client import get_supabase

app = FastAPI(title="Goal Tracker API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (frontend dist folder)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")


@app.get("/api")
async def api_root():
    return {"message": "Goal Tracker API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/goals", response_model=list[models.Goal])
async def read_goals(supabase: Client = Depends(get_supabase)):
    goals = await crud.get_goals(supabase)
    return goals


@app.get("/api/goals/{goal_id}", response_model=models.Goal)
async def read_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    goal = await crud.get_goal(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.post("/api/goals", response_model=models.Goal, status_code=201)
async def create_goal(goal: models.GoalCreate, supabase: Client = Depends(get_supabase)):
    return await crud.create_goal(supabase, goal)


@app.put("/api/goals/{goal_id}", response_model=models.Goal)
async def update_goal(
    goal_id: int,
    goal: models.GoalUpdate,
    supabase: Client = Depends(get_supabase)
):
    updated_goal = await crud.update_goal(supabase, goal_id, goal)
    if updated_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated_goal


@app.delete("/api/goals/{goal_id}", status_code=204)
async def delete_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    success = await crud.delete_goal(supabase, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return None


# Serve frontend for all other routes (SPA fallback)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the React frontend for all non-API routes."""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Frontend not found. Build the frontend first."}
