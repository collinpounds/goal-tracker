"""
Goals API router using model CRUD methods.
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List

from ..models.goal import Goal, GoalCreate, GoalUpdate
from ..supabase_client import get_supabase
from ..auth import get_current_user_id

router = APIRouter()


@router.get(
    "/goals",
    summary="List all goals for authenticated user",
    response_description="A list of user's goals with team information ordered by creation date (newest first)",
)
async def read_goals(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all goals for the authenticated user with team information.

    Returns a list of the user's goals ordered by creation date in descending order (newest first).
    Each goal includes a 'teams' array with team details.
    The list will be empty if the user has no goals.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Example Response:**
    ```json
    [
      {
        "id": 1,
        "title": "Learn FastAPI",
        "description": "Complete the official tutorial",
        "status": "in_progress",
        "target_date": "2025-12-31T00:00:00Z",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2025-01-15T10:30:00Z",
        "teams": [
          {"id": 1, "name": "Backend Team", "color_theme": "#3B82F6"}
        ]
      },
      {
        "id": 2,
        "title": "Build a REST API",
        "description": null,
        "status": "pending",
        "target_date": null,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2025-01-14T09:20:00Z",
        "teams": []
      }
    ]
    ```
    """
    goals = await Goal.get_all(supabase, user_id)
    return goals


@router.get(
    "/goals/public",
    response_model=List[Goal],
    summary="List all public goals from all users",
    response_description="A list of public goals ordered by creation date (newest first)",
)
async def read_public_goals(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all public goals from all authenticated users.

    Returns a list of goals marked as public, ordered by creation date in descending order (newest first).
    Only shows goals where is_public=true.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Example Response:**
    ```json
    [
      {
        "id": 5,
        "title": "Run a marathon",
        "description": "Complete a full marathon",
        "status": "in_progress",
        "target_date": "2025-10-01T00:00:00Z",
        "is_public": true,
        "user_id": "different-user-id",
        "created_at": "2025-01-15T10:30:00Z"
      }
    ]
    ```
    """
    goals = await Goal.get_all_public(supabase)
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
async def read_goal(
    goal_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve a single goal by its unique ID for the authenticated user.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal (integer)

    **Returns:**
    - The goal object if found and belongs to the user
    - 404 error if the goal does not exist or doesn't belong to the user
    """
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
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
async def create_goal(
    goal_data: GoalCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new goal in the database for the authenticated user.

    **Authentication Required:** Bearer token must be provided in Authorization header.

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
    - The created goal with auto-generated ID, user_id, and created_at timestamp
    """
    return await goal_data.save(supabase, user_id)


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
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update an existing goal for the authenticated user.

    All fields in the request body are optional. Only provided fields will be updated.
    Fields not included in the request will retain their current values.

    **Authentication Required:** Bearer token must be provided in Authorization header.

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
    - 404 error if the goal does not exist or doesn't belong to the user
    """
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    updated_goal = await goal.update(supabase, goal_data, user_id)
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
async def delete_goal(
    goal_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a goal from the database for the authenticated user.

    This operation is permanent and cannot be undone.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal to delete

    **Returns:**
    - 204 No Content on successful deletion
    - 404 error if the goal does not exist or doesn't belong to the user
    """
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    await goal.delete(supabase, user_id)
    return None
