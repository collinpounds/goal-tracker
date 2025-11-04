"""
Goals API router using model CRUD methods.
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List

from ..models.goal import Goal, GoalCreate, GoalUpdate
from ..supabase_client import get_supabase

router = APIRouter()


@router.get("/goals", response_model=List[Goal])
async def read_goals(supabase: Client = Depends(get_supabase)):
    """Get all goals."""
    goals = await Goal.get_all(supabase)
    return goals


@router.get("/goals/{goal_id}", response_model=Goal)
async def read_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    """Get a single goal by ID."""
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("/goals", response_model=Goal, status_code=201)
async def create_goal(goal_data: GoalCreate, supabase: Client = Depends(get_supabase)):
    """Create a new goal."""
    return await goal_data.save(supabase)


@router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    supabase: Client = Depends(get_supabase)
):
    """Update an existing goal."""
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    updated_goal = await goal.update(supabase, goal_data)
    if updated_goal is None:
        raise HTTPException(status_code=500, detail="Failed to update goal")

    return updated_goal


@router.delete("/goals/{goal_id}", status_code=204)
async def delete_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    """Delete a goal."""
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    await goal.delete(supabase)
    return None
