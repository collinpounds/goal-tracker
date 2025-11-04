"""
CRUD operations using Supabase client.
"""
from supabase import Client
from . import schemas
from typing import List, Optional
from datetime import datetime


async def get_goals(supabase: Client) -> List[dict]:
    """
    Retrieve all goals ordered by created_at descending.
    """
    response = supabase.table("goals").select("*").order("created_at", desc=True).execute()
    return response.data


async def get_goal(supabase: Client, goal_id: int) -> Optional[dict]:
    """
    Retrieve a single goal by ID.
    """
    response = supabase.table("goals").select("*").eq("id", goal_id).execute()

    if response.data and len(response.data) > 0:
        return response.data[0]
    return None


async def create_goal(supabase: Client, goal: schemas.GoalCreate) -> dict:
    """
    Create a new goal.
    """
    goal_data = {
        "title": goal.title,
        "description": goal.description,
        "status": goal.status.value,
        "target_date": goal.target_date.isoformat() if goal.target_date else None,
    }

    response = supabase.table("goals").insert(goal_data).execute()

    if response.data and len(response.data) > 0:
        return response.data[0]

    raise Exception("Failed to create goal")


async def update_goal(
    supabase: Client,
    goal_id: int,
    goal: schemas.GoalUpdate
) -> Optional[dict]:
    """
    Update an existing goal.
    """
    # Build update data, excluding unset fields
    update_data = {}

    if goal.title is not None:
        update_data["title"] = goal.title
    if goal.description is not None:
        update_data["description"] = goal.description
    if goal.status is not None:
        update_data["status"] = goal.status.value
    if goal.target_date is not None:
        update_data["target_date"] = goal.target_date.isoformat()

    if not update_data:
        # Nothing to update, return the existing goal
        return await get_goal(supabase, goal_id)

    response = supabase.table("goals").update(update_data).eq("id", goal_id).execute()

    if response.data and len(response.data) > 0:
        return response.data[0]

    return None


async def delete_goal(supabase: Client, goal_id: int) -> bool:
    """
    Delete a goal by ID.
    Returns True if successful, False if goal not found.
    """
    # First check if goal exists
    existing_goal = await get_goal(supabase, goal_id)
    if not existing_goal:
        return False

    response = supabase.table("goals").delete().eq("id", goal_id).execute()
    return True
