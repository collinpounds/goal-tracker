"""
Category Pydantic models (schemas) with CRUD methods.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from supabase import Client


class CategoryBase(BaseModel):
    """Base category schema with common attributes."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The name of the category",
        examples=["Work", "Personal", "Health", "Learning"]
    )
    color: str = Field(
        "#3B82F6",
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Hex color code for category",
        examples=["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
    )
    icon: Optional[str] = Field(
        None,
        max_length=50,
        description="Optional icon name",
        examples=["briefcase", "heart", "star", "book"]
    )


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""

    async def save(self, supabase: Client, user_id: str) -> "Category":
        """
        Create a new category in the database.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user creating the category

        Returns:
            Created Category instance
        """
        category_data = {
            "name": self.name,
            "color": self.color,
            "icon": self.icon,
            "user_id": user_id,
        }

        response = supabase.table("categories").insert(category_data).execute()

        if response.data and len(response.data) > 0:
            return Category(**response.data[0])

        raise Exception("Failed to create category")


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Updated name for the category"
    )
    color: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Updated hex color code"
    )
    icon: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated icon name"
    )


class Category(CategoryBase):
    """Complete category schema with database fields and CRUD methods."""
    id: int = Field(
        ...,
        description="Unique identifier for the category (auto-generated)",
        examples=[1, 42, 123]
    )
    user_id: str = Field(
        ...,
        description="UUID of the user who owns this category",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the category was created (auto-generated)",
        examples=["2025-01-15T10:30:00Z"]
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Work",
                "color": "#3B82F6",
                "icon": "briefcase",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2025-01-15T10:30:00Z"
            }
        }

    @classmethod
    async def get_all(cls, supabase: Client, user_id: str) -> List["Category"]:
        """
        Retrieve all categories for a specific user, ordered by name.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user whose categories to retrieve

        Returns:
            List of Category instances belonging to the user
        """
        response = (
            supabase.table("categories")
            .select("*")
            .eq("user_id", user_id)
            .order("name")
            .execute()
        )
        return [cls(**category) for category in response.data]

    @classmethod
    async def get_by_id(cls, supabase: Client, category_id: int, user_id: str) -> Optional["Category"]:
        """
        Retrieve a single category by ID for a specific user.

        Args:
            supabase: Supabase client instance
            category_id: Category ID to retrieve
            user_id: UUID of the user who owns the category

        Returns:
            Category instance if found and belongs to user, None otherwise
        """
        response = (
            supabase.table("categories")
            .select("*")
            .eq("id", category_id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    async def update(self, supabase: Client, update_data: CategoryUpdate, user_id: str) -> Optional["Category"]:
        """
        Update this category with new data.

        Args:
            supabase: Supabase client instance
            update_data: CategoryUpdate instance with fields to update
            user_id: UUID of the user updating the category (for ownership verification)

        Returns:
            Updated Category instance if successful, None otherwise
        """
        # Build update data, excluding unset fields
        update_dict = {}

        if update_data.name is not None:
            update_dict["name"] = update_data.name
        if update_data.color is not None:
            update_dict["color"] = update_data.color
        if update_data.icon is not None:
            update_dict["icon"] = update_data.icon

        if not update_dict:
            # Nothing to update, return self
            return self

        response = (
            supabase.table("categories")
            .update(update_dict)
            .eq("id", self.id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return Category(**response.data[0])

        return None

    async def delete(self, supabase: Client, user_id: str) -> bool:
        """
        Delete this category from the database.
        This will cascade delete all goal_categories associations.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user deleting the category (for ownership verification)

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("categories")
            .delete()
            .eq("id", self.id)
            .eq("user_id", user_id)
            .execute()
        )
        return True

    @classmethod
    async def get_goals_by_category(cls, supabase: Client, category_id: int, user_id: str) -> List[dict]:
        """
        Get all goals associated with a specific category for a user.

        Args:
            supabase: Supabase client instance
            category_id: Category ID to filter by
            user_id: UUID of the user

        Returns:
            List of goals with this category
        """
        response = (
            supabase.table("goal_categories")
            .select("goals(*, goal_teams(team_id, teams(id, name, color_theme)))")
            .eq("category_id", category_id)
            .eq("goals.user_id", user_id)
            .execute()
        )

        # Transform the data to extract goals with their teams
        goals = []
        for item in response.data:
            if item and "goals" in item and item["goals"]:
                goal_data = item["goals"]

                # Extract teams from goal_teams relationship
                teams = []
                if "goal_teams" in goal_data and goal_data["goal_teams"]:
                    for gt in goal_data["goal_teams"]:
                        if gt and "teams" in gt and gt["teams"]:
                            teams.append(gt["teams"])

                # Clean up the goal data
                goal_data_clean = {k: v for k, v in goal_data.items() if k != "goal_teams"}
                goal_data_clean["teams"] = teams
                goals.append(goal_data_clean)

        return goals
