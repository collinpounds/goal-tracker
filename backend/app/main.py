from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os

from . import models, crud
from .database import get_db, init_db

app = FastAPI(title="Goal Tracker API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Goal Tracker API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/goals", response_model=List[models.Goal])
async def read_goals(db: AsyncSession = Depends(get_db)):
    goals = await crud.get_goals(db)
    return goals


@app.get("/api/goals/{goal_id}", response_model=models.Goal)
async def read_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    goal = await crud.get_goal(db, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.post("/api/goals", response_model=models.Goal, status_code=201)
async def create_goal(goal: models.GoalCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_goal(db, goal)


@app.put("/api/goals/{goal_id}", response_model=models.Goal)
async def update_goal(
    goal_id: int,
    goal: models.GoalUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated_goal = await crud.update_goal(db, goal_id, goal)
    if updated_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated_goal


@app.delete("/api/goals/{goal_id}", status_code=204)
async def delete_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return None
