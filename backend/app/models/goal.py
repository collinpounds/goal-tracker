"""
Goal Pydantic models (schemas) with CRUD methods.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from supabase import Client


class GoalStatus(str, Enum):
    """Goal status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class GoalScope(str, Enum):
    """Goal scope enumeration."""
    PRIVATE = "private"
    PUBLIC = "public"
    TEAM = "team"


class GoalBase(BaseModel):
    """Base goal schema with common attributes."""
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The title of the goal",
        examples=["Learn FastAPI", "Build a REST API", "Complete project documentation"]
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description of the goal",
        examples=["Complete the official FastAPI tutorial and build a sample project"]
    )
    status: str = Field(
        "pending",
        description="Current status of the goal (supports custom statuses)"
    )
    target_date: Optional[datetime] = Field(
        None,
        description="Target completion date (ISO 8601 format)",
        examples=["2025-12-31T00:00:00"]
    )
    is_public: bool = Field(
        False,
        description="Whether this goal is visible to other authenticated users"
    )
    scope: GoalScope = Field(
        GoalScope.PRIVATE,
        description="Scope of the goal (private, public, or team)"
    )
    parent_goal_id: Optional[int] = Field(
        None,
        description="ID of parent goal (for sub-goals)"
    )
    display_order: int = Field(
        0,
        ge=0,
        description="Order of sub-goal within parent"
    )
    template_id: Optional[int] = Field(
        None,
        description="ID of template used to create this goal"
    )


class GoalCreate(GoalBase):
    """Schema for creating a new goal."""

    async def save(self, supabase: Client, user_id: str) -> "Goal":
        """
        Create a new goal in the database.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user creating the goal

        Returns:
            Created Goal instance
        """
        # Determine scope based on is_public flag if scope not explicitly set
        scope = self.scope
        if self.is_public and scope == GoalScope.PRIVATE:
            scope = GoalScope.PUBLIC

        goal_data = {
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "target_date": self.target_date.isoformat() if self.target_date else None,
            "user_id": user_id,
            "is_public": self.is_public,
            "scope": scope.value,
            "parent_goal_id": self.parent_goal_id,
            "display_order": self.display_order,
            "template_id": self.template_id,
        }

        response = supabase.table("goals").insert(goal_data).execute()

        if response.data and len(response.data) > 0:
            return Goal(**response.data[0])

        raise Exception("Failed to create goal")


class GoalUpdate(BaseModel):
    """Schema for updating an existing goal. All fields are optional."""
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated title for the goal",
        examples=["Learn FastAPI Advanced Topics"]
    )
    description: Optional[str] = Field(
        None,
        description="Updated description for the goal"
    )
    status: Optional[str] = Field(
        None,
        description="Updated status for the goal (supports custom statuses)"
    )
    target_date: Optional[datetime] = Field(
        None,
        description="Updated target completion date",
        examples=["2025-12-31T00:00:00"]
    )
    is_public: Optional[bool] = Field(
        None,
        description="Whether this goal is visible to other authenticated users"
    )
    scope: Optional[GoalScope] = Field(
        None,
        description="Scope of the goal (private, public, or team)"
    )
    parent_goal_id: Optional[int] = Field(
        None,
        description="Updated parent goal ID (for moving sub-goals)"
    )
    display_order: Optional[int] = Field(
        None,
        ge=0,
        description="Updated display order"
    )


class Goal(GoalBase):
    """Complete goal schema with database fields and CRUD methods."""
    id: int = Field(
        ...,
        description="Unique identifier for the goal (auto-generated)",
        examples=[1, 42, 123]
    )
    user_id: str = Field(
        ...,
        description="UUID of the user who owns this goal",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the goal was created (auto-generated)",
        examples=["2025-01-15T10:30:00Z"]
    )
    subgoals: Optional[List["Goal"]] = Field(
        default_factory=list,
        description="List of sub-goals (recursive)"
    )
    files: Optional[List[dict]] = Field(
        default_factory=list,
        description="List of file attachments"
    )
    teams: Optional[List[dict]] = Field(
        default_factory=list,
        description="List of teams this goal is assigned to"
    )
    categories: Optional[List[dict]] = Field(
        default_factory=list,
        description="List of categories for this goal"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Learn FastAPI",
                "description": "Complete the official FastAPI tutorial and build a sample project",
                "status": "in_progress",
                "target_date": "2025-12-31T00:00:00",
                "created_at": "2025-01-15T10:30:00"
            }
        }

    @classmethod
    async def get_all(
        cls,
        supabase: Client,
        user_id: str,
        search: Optional[str] = None,
        status: Optional[List[str]] = None,
        category_ids: Optional[List[int]] = None,
        target_date_from: Optional[datetime] = None,
        target_date_to: Optional[datetime] = None,
        sort_by: str = "target_date",
        sort_order: str = "asc"
    ) -> List[dict]:
        """
        Retrieve all goals for a specific user with team and category information.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user whose goals to retrieve
            search: Optional text search in title/description
            status: Optional list of status values to filter by
            category_ids: Optional list of category IDs to filter by
            target_date_from: Optional start date for target_date range
            target_date_to: Optional end date for target_date range
            sort_by: Field to sort by (default: target_date)
            sort_order: Sort direction - asc or desc (default: asc)

        Returns:
            List of Goal instances with team and category data belonging to the user
        """
        # Build the query with joins
        query = supabase.table("goals").select(
            "*, goal_teams(team_id, teams(id, name, color_theme)), goal_categories(category_id, categories(id, name, color, icon))"
        ).eq("user_id", user_id)

        # Apply filters
        if search:
            # PostgreSQL ILIKE search (case-insensitive)
            search_term = f"%{search}%"
            query = query.or_(f"title.ilike.{search_term},description.ilike.{search_term}")

        if status:
            query = query.in_("status", status)

        if target_date_from:
            query = query.gte("target_date", target_date_from.isoformat())

        if target_date_to:
            query = query.lte("target_date", target_date_to.isoformat())

        # Apply sorting
        # Special handling for target_date to put nulls first
        if sort_by == "target_date":
            if sort_order == "asc":
                query = query.order("target_date", desc=False, nullsfirst=True)
            else:
                query = query.order("target_date", desc=True, nullsfirst=False)
        else:
            query = query.order(sort_by, desc=(sort_order == "desc"))

        response = query.execute()

        # Transform the data to include teams and categories arrays
        goals_with_relations = []
        for goal_data in response.data:
            # Extract teams from goal_teams relationship
            teams = []
            if "goal_teams" in goal_data and goal_data["goal_teams"]:
                for gt in goal_data["goal_teams"]:
                    if gt and "teams" in gt and gt["teams"]:
                        teams.append(gt["teams"])

            # Extract categories from goal_categories relationship
            categories = []
            if "goal_categories" in goal_data and goal_data["goal_categories"]:
                for gc in goal_data["goal_categories"]:
                    if gc and "categories" in gc and gc["categories"]:
                        categories.append(gc["categories"])

            # Remove junction tables from the goal data
            goal_data_clean = {k: v for k, v in goal_data.items() if k not in ["goal_teams", "goal_categories"]}
            goal_data_clean["teams"] = teams
            goal_data_clean["categories"] = categories
            # Initialize files and subgoals as empty arrays (will be populated separately if needed)
            goal_data_clean["files"] = []
            goal_data_clean["subgoals"] = []

            goals_with_relations.append(goal_data_clean)

        # Filter by category if specified (post-query since it's a many-to-many)
        if category_ids:
            filtered_goals = []
            for goal in goals_with_relations:
                goal_category_ids = [cat["id"] for cat in goal["categories"]]
                has_match = any(cat_id in category_ids for cat_id in goal_category_ids)
                if has_match:
                    filtered_goals.append(goal)
            goals_with_relations = filtered_goals

        return goals_with_relations

    @classmethod
    async def get_all_public(cls, supabase: Client) -> List["Goal"]:
        """
        Retrieve all public goals from all users, ordered by created_at descending.
        Includes teams and categories for each goal.

        Args:
            supabase: Supabase client instance

        Returns:
            List of public goals with teams and categories
        """
        response = (
            supabase.table("goals")
            .select("*, goal_teams(team_id, teams(id, name, color_theme)), goal_categories(category_id, categories(id, name, color, icon))")
            .eq("is_public", True)
            .order("created_at", desc=True)
            .execute()
        )

        # Transform the data to include teams and categories arrays
        goals_with_relations = []
        for goal_data in response.data:
            # Extract teams from goal_teams relationship
            teams = []
            if "goal_teams" in goal_data and goal_data["goal_teams"]:
                for gt in goal_data["goal_teams"]:
                    if gt and "teams" in gt and gt["teams"]:
                        teams.append(gt["teams"])

            # Extract categories from goal_categories relationship
            categories = []
            if "goal_categories" in goal_data and goal_data["goal_categories"]:
                for gc in goal_data["goal_categories"]:
                    if gc and "categories" in gc and gc["categories"]:
                        categories.append(gc["categories"])

            # Remove junction tables from the goal data
            goal_data_clean = {k: v for k, v in goal_data.items() if k not in ["goal_teams", "goal_categories"]}
            goal_data_clean["teams"] = teams
            goal_data_clean["categories"] = categories
            # Initialize files and subgoals as empty arrays (will be populated separately if needed)
            goal_data_clean["files"] = []
            goal_data_clean["subgoals"] = []

            goals_with_relations.append(goal_data_clean)

        return goals_with_relations

    @classmethod
    async def get_by_id(cls, supabase: Client, goal_id: int, user_id: str) -> Optional["Goal"]:
        """
        Retrieve a single goal by ID for a specific user.

        Args:
            supabase: Supabase client instance
            goal_id: Goal ID to retrieve
            user_id: UUID of the user who owns the goal

        Returns:
            Goal instance if found and belongs to user, None otherwise
        """
        response = (
            supabase.table("goals")
            .select("*")
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    async def update(self, supabase: Client, update_data: GoalUpdate, user_id: str) -> Optional["Goal"]:
        """
        Update this goal with new data.

        Args:
            supabase: Supabase client instance
            update_data: GoalUpdate instance with fields to update
            user_id: UUID of the user updating the goal (for ownership verification)

        Returns:
            Updated Goal instance if successful, None otherwise
        """
        # Build update data, excluding unset fields
        update_dict = {}

        if update_data.title is not None:
            update_dict["title"] = update_data.title
        if update_data.description is not None:
            update_dict["description"] = update_data.description
        if update_data.status is not None:
            update_dict["status"] = update_data.status
        if update_data.target_date is not None:
            update_dict["target_date"] = update_data.target_date.isoformat()
        if update_data.is_public is not None:
            update_dict["is_public"] = update_data.is_public
        if update_data.scope is not None:
            update_dict["scope"] = update_data.scope.value
        if update_data.parent_goal_id is not None:
            update_dict["parent_goal_id"] = update_data.parent_goal_id
        if update_data.display_order is not None:
            update_dict["display_order"] = update_data.display_order

        if not update_dict:
            # Nothing to update, return self
            return self

        response = (
            supabase.table("goals")
            .update(update_dict)
            .eq("id", self.id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return Goal(**response.data[0])

        return None

    async def delete(self, supabase: Client, user_id: str) -> bool:
        """
        Delete this goal from the database.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user deleting the goal (for ownership verification)

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("goals")
            .delete()
            .eq("id", self.id)
            .eq("user_id", user_id)
            .execute()
        )
        return True
