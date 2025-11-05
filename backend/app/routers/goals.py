"""
Goals API router using model CRUD methods.
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List

from ..models.goal import Goal, GoalCreate, GoalUpdate
from ..supabase_client import get_supabase

router = APIRouter()


@router.get(
    "/goals",
    response_model=List[Goal],
    summary="List all goals",
    response_description="A list of all goals ordered by creation date (newest first)",
)
async def read_goals(supabase: Client = Depends(get_supabase)):
    """
    Retrieve all goals from the database.

    Returns a list of all goals ordered by creation date in descending order (newest first).
    The list will be empty if no goals exist.

    **Example Response:**
    ```json
    [
      {
        "id": 1,
        "title": "Learn FastAPI",
        "description": "Complete the official tutorial",
        "status": "in_progress",
        "target_date": "2025-12-31T00:00:00Z",
        "created_at": "2025-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "title": "Build a REST API",
        "description": null,
        "status": "pending",
        "target_date": null,
        "created_at": "2025-01-14T09:20:00Z"
      }
    ]
    ```
    """
    goals = await Goal.get_all(supabase)
    return goals


@router.get(
    "/goals/{goal_id}",
    response_model=Goal,
    summary="Get a single goal",
    response_description="The goal with the specified ID",
    responses={
        200: {
            "description": "Goal found and returned successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "title": "Learn FastAPI",
                        "description": "Complete the official tutorial and build a project",
                        "status": "in_progress",
                        "target_date": "2025-12-31T00:00:00Z",
                        "created_at": "2025-01-15T10:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Goal not found"}
                }
            }
        }
    }
)
async def read_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    """
    Retrieve a single goal by its unique ID.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal (integer)

    **Returns:**
    - The goal object if found
    - 404 error if the goal does not exist
    """
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post(
    "/goals",
    response_model=Goal,
    status_code=201,
    summary="Create a new goal",
    response_description="The created goal with generated ID and timestamps",
    responses={
        201: {
            "description": "Goal created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 3,
                        "title": "Build a REST API",
                        "description": "Create a production-ready API with FastAPI",
                        "status": "pending",
                        "target_date": "2025-06-01T00:00:00Z",
                        "created_at": "2025-01-15T14:30:00Z"
                    }
                }
            }
        },
        422: {
            "description": "Validation error - invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "title"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def create_goal(goal_data: GoalCreate, supabase: Client = Depends(get_supabase)):
    """
    Create a new goal in the database.

    **Request Body:**
    - **title** (required): Goal title (1-200 characters)
    - **description** (optional): Detailed description of the goal
    - **status** (optional): Goal status - "pending", "in_progress", or "completed" (default: "pending")
    - **target_date** (optional): Target completion date in ISO 8601 format

    **Example Request:**
    ```json
    {
      "title": "Build a REST API",
      "description": "Create a production-ready API with FastAPI",
      "status": "pending",
      "target_date": "2025-06-01T00:00:00"
    }
    ```

    **Returns:**
    - The created goal with auto-generated ID and created_at timestamp
    """
    return await goal_data.save(supabase)


@router.put(
    "/goals/{goal_id}",
    response_model=Goal,
    summary="Update an existing goal",
    response_description="The updated goal",
    responses={
        200: {
            "description": "Goal updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "title": "Learn FastAPI Advanced Topics",
                        "description": "Complete the official tutorial and build a project",
                        "status": "completed",
                        "target_date": "2025-12-31T00:00:00Z",
                        "created_at": "2025-01-15T10:30:00Z"
                    }
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Goal not found"}
                }
            }
        },
        422: {
            "description": "Validation error - invalid input data"
        }
    }
)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    supabase: Client = Depends(get_supabase)
):
    """
    Update an existing goal.

    All fields in the request body are optional. Only provided fields will be updated.
    Fields not included in the request will retain their current values.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal to update

    **Request Body (all fields optional):**
    - **title**: New goal title (1-200 characters)
    - **description**: New description
    - **status**: New status - "pending", "in_progress", or "completed"
    - **target_date**: New target date in ISO 8601 format

    **Example Request:**
    ```json
    {
      "status": "completed"
    }
    ```

    **Returns:**
    - The updated goal with all current values
    - 404 error if the goal does not exist
    """
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    updated_goal = await goal.update(supabase, goal_data)
    if updated_goal is None:
        raise HTTPException(status_code=500, detail="Failed to update goal")

    return updated_goal


@router.delete(
    "/goals/{goal_id}",
    status_code=204,
    summary="Delete a goal",
    response_description="No content - goal deleted successfully",
    responses={
        204: {
            "description": "Goal deleted successfully - no content returned"
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Goal not found"}
                }
            }
        }
    }
)
async def delete_goal(goal_id: int, supabase: Client = Depends(get_supabase)):
    """
    Delete a goal from the database.

    This operation is permanent and cannot be undone.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal to delete

    **Returns:**
    - 204 No Content on successful deletion
    - 404 error if the goal does not exist
    """
    goal = await Goal.get_by_id(supabase, goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    await goal.delete(supabase)
    return None
