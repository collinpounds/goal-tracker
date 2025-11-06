"""
Categories router - handles all category-related API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client

from ..supabase_client import get_supabase
from ..auth import get_current_user_id
from ..models.category import Category, CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("/categories", response_model=List[Category])
async def get_categories(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all categories for the authenticated user, ordered by name.

    Returns:
        List of categories belonging to the user
    """
    categories = await Category.get_all(supabase, user_id)
    return categories


@router.get("/categories/{category_id}", response_model=Category)
async def get_category(
    category_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific category by ID.

    Args:
        category_id: The ID of the category to retrieve

    Returns:
        The requested category

    Raises:
        404: Category not found or doesn't belong to user
    """
    category = await Category.get_by_id(supabase, category_id, user_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )

    return category


@router.get("/categories/{category_id}/goals")
async def get_category_goals(
    category_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all goals associated with a specific category.

    Args:
        category_id: The ID of the category

    Returns:
        List of goals with this category

    Raises:
        404: Category not found or doesn't belong to user
    """
    # Verify category exists and belongs to user
    category = await Category.get_by_id(supabase, category_id, user_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )

    goals = await Category.get_goals_by_category(supabase, category_id, user_id)
    return goals


@router.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new category.

    Args:
        category_data: Category data (name, color, icon)

    Returns:
        The created category

    Raises:
        400: Invalid data or duplicate category name for user
    """
    try:
        category = await category_data.save(supabase, user_id)
        return category
    except Exception as e:
        error_msg = str(e)
        if "categories_name_user_unique" in error_msg or "duplicate" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with name '{category_data.name}' already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create category: {error_msg}"
        )


@router.put("/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    update_data: CategoryUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update an existing category.

    Args:
        category_id: The ID of the category to update
        update_data: Fields to update (all optional)

    Returns:
        The updated category

    Raises:
        404: Category not found or doesn't belong to user
        400: Invalid update data or duplicate name
    """
    category = await Category.get_by_id(supabase, category_id, user_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )

    try:
        updated_category = await category.update(supabase, update_data, user_id)

        if not updated_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update category"
            )

        return updated_category
    except Exception as e:
        error_msg = str(e)
        if "categories_name_user_unique" in error_msg or "duplicate" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with name '{update_data.name}' already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update category: {error_msg}"
        )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a category.
    This will remove all associations with goals but won't delete the goals themselves.

    Args:
        category_id: The ID of the category to delete

    Raises:
        404: Category not found or doesn't belong to user
    """
    category = await Category.get_by_id(supabase, category_id, user_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )

    await category.delete(supabase, user_id)
    return None
