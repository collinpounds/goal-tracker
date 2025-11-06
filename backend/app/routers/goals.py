"""
Goals API router using model CRUD methods.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import List, Optional
from datetime import datetime

from ..models.goal import Goal, GoalCreate, GoalUpdate
from ..supabase_client import get_supabase
from ..auth import get_current_user_id

router = APIRouter()


@router.get(
    "/goals",
    summary="List all goals for authenticated user with search, filter, and sort",
    response_description="A list of user's goals with team and category information",
)
async def read_goals(
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: Optional[List[str]] = Query(None, description="Filter by status (pending, in_progress, completed)"),
    category_ids: Optional[List[int]] = Query(None, description="Filter by category IDs"),
    target_date_from: Optional[datetime] = Query(None, description="Filter by target date from (ISO 8601)"),
    target_date_to: Optional[datetime] = Query(None, description="Filter by target date to (ISO 8601)"),
    sort_by: str = Query("target_date", description="Field to sort by (target_date, created_at, title, status)"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all goals for the authenticated user with team and category information.

    Supports powerful filtering, searching, and sorting capabilities.

    **Query Parameters:**
    - **search**: Text search in title and description (case-insensitive)
    - **status**: Filter by one or more status values (pending, in_progress, completed)
    - **category_ids**: Filter by one or more category IDs
    - **target_date_from**: Filter goals with target_date >= this date
    - **target_date_to**: Filter goals with target_date <= this date
    - **sort_by**: Field to sort by (default: target_date)
      - target_date: Sort by target date (nulls first for asc, last for desc)
      - created_at: Sort by creation date
      - title: Sort alphabetically by title
      - status: Sort by status
    - **sort_order**: Sort direction (asc or desc, default: asc)

    **Default Behavior:**
    - Goals are sorted by target_date in ascending order (soonest first)
    - Goals with null target_date appear first

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
        ],
        "categories": [
          {"id": 1, "name": "Work", "color": "#3B82F6", "icon": "briefcase"}
        ]
      }
    ]
    ```
    """
    goals = await Goal.get_all(
        supabase,
        user_id,
        search=search,
        status=status,
        category_ids=category_ids,
        target_date_from=target_date_from,
        target_date_to=target_date_to,
        sort_by=sort_by,
        sort_order=sort_order
    )
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

    # Fetch the complete goal with team and category information
    response = (
        supabase.table("goals")
        .select("*, goal_teams(team_id, teams(id, name, color_theme)), goal_categories(category_id, categories(id, name, color, icon))")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data or len(response.data) == 0:
        return updated_goal

    goal_data_complete = response.data[0]

    # Extract teams from goal_teams relationship
    teams = []
    if "goal_teams" in goal_data_complete and goal_data_complete["goal_teams"]:
        for gt in goal_data_complete["goal_teams"]:
            if gt and "teams" in gt and gt["teams"]:
                teams.append(gt["teams"])

    # Extract categories from goal_categories relationship
    categories = []
    if "goal_categories" in goal_data_complete and goal_data_complete["goal_categories"]:
        for gc in goal_data_complete["goal_categories"]:
            if gc and "categories" in gc and gc["categories"]:
                categories.append(gc["categories"])

    # Remove junction tables from the goal data
    goal_data_clean = {k: v for k, v in goal_data_complete.items() if k not in ["goal_teams", "goal_categories"]}
    goal_data_clean["teams"] = teams
    goal_data_clean["categories"] = categories

    return goal_data_clean


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


@router.post(
    "/goals/{goal_id}/categories",
    status_code=201,
    summary="Assign goal to categories",
    response_description="Success message"
)
async def assign_goal_to_categories(
    goal_id: int,
    category_ids: List[int],
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Assign a goal to one or more categories.

    This endpoint replaces all existing category assignments with the new ones.
    User must own the goal and all specified categories.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Request Body:**
    - **category_ids**: List of category IDs to assign to the goal (array of integers)

    **Example Request:**
    ```json
    [1, 2, 3]
    ```
    """
    # Verify goal exists and user owns it
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found or you do not own it")

    # Verify user owns all specified categories
    from ..models.category import Category
    for category_id in category_ids:
        category = await Category.get_by_id(supabase, category_id, user_id)
        if not category:
            raise HTTPException(
                status_code=404,
                detail=f"Category {category_id} not found or you do not own it"
            )

    # Remove all existing category assignments for this goal first
    supabase.table("goal_categories").delete().eq("goal_id", goal_id).execute()

    # Assign goal to all categories
    for category_id in category_ids:
        try:
            supabase.table("goal_categories").insert({
                "goal_id": goal_id,
                "category_id": category_id
            }).execute()
        except Exception as e:
            error_msg = str(e)
            # If already assigned, that's okay
            if "goal_categories_unique" not in error_msg and "duplicate" not in error_msg.lower():
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to assign goal to category {category_id}: {error_msg}"
                )

    return {"message": f"Goal assigned to {len(category_ids)} category(s)"}


@router.post(
    "/goals/{goal_id}/categories/{category_id}",
    status_code=201,
    summary="Add a category to a goal",
    response_description="Category added to goal successfully"
)
async def add_category_to_goal(
    goal_id: int,
    category_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Add a category to a goal.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal
    - **category_id**: The unique identifier of the category to add

    **Returns:**
    - 201 Created on success
    - 404 if goal or category not found or doesn't belong to user
    - 400 if category already added to goal
    """
    # Verify goal exists and belongs to user
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Verify category exists and belongs to user
    from ..models.category import Category
    category = await Category.get_by_id(supabase, category_id, user_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Add the association
    try:
        response = supabase.table("goal_categories").insert({
            "goal_id": goal_id,
            "category_id": category_id
        }).execute()

        return {"message": "Category added to goal successfully"}
    except Exception as e:
        error_msg = str(e)
        # If already assigned, that's okay - just return success
        if "goal_categories_unique" in error_msg or "duplicate" in error_msg.lower():
            return {"message": "Category already assigned to this goal"}
        raise HTTPException(status_code=400, detail=f"Failed to add category: {error_msg}")


@router.delete(
    "/goals/{goal_id}/categories/{category_id}",
    status_code=204,
    summary="Remove a category from a goal",
    response_description="Category removed from goal successfully"
)
async def remove_category_from_goal(
    goal_id: int,
    category_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Remove a category from a goal.

    **Authentication Required:** Bearer token must be provided in Authorization header.

    **Path Parameters:**
    - **goal_id**: The unique identifier of the goal
    - **category_id**: The unique identifier of the category to remove

    **Returns:**
    - 204 No Content on success
    - 404 if goal or category not found or doesn't belong to user
    """
    # Verify goal exists and belongs to user
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Verify category exists and belongs to user
    from ..models.category import Category
    category = await Category.get_by_id(supabase, category_id, user_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Remove the association
    supabase.table("goal_categories").delete().eq("goal_id", goal_id).eq("category_id", category_id).execute()

    return None
