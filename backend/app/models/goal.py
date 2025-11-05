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
    status: GoalStatus = Field(
        GoalStatus.PENDING,
        description="Current status of the goal"
    )
    target_date: Optional[datetime] = Field(
        None,
        description="Target completion date (ISO 8601 format)",
        examples=["2025-12-31T00:00:00"]
    )


class GoalCreate(GoalBase):
    """Schema for creating a new goal."""

    async def save(self, supabase: Client) -> "Goal":
        """
        Create a new goal in the database.

        Args:
            supabase: Supabase client instance

        Returns:
            Created Goal instance
        """
        goal_data = {
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "target_date": self.target_date.isoformat() if self.target_date else None,
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
    status: Optional[GoalStatus] = Field(
        None,
        description="Updated status for the goal"
    )
    target_date: Optional[datetime] = Field(
        None,
        description="Updated target completion date",
        examples=["2025-12-31T00:00:00"]
    )


class Goal(GoalBase):
    """Complete goal schema with database fields and CRUD methods."""
    id: int = Field(
        ...,
        description="Unique identifier for the goal (auto-generated)",
        examples=[1, 42, 123]
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the goal was created (auto-generated)",
        examples=["2025-01-15T10:30:00Z"]
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
    async def get_all(cls, supabase: Client) -> List["Goal"]:
        """
        Retrieve all goals ordered by created_at descending.

        Args:
            supabase: Supabase client instance

        Returns:
            List of Goal instances
        """
        response = supabase.table("goals").select("*").order("created_at", desc=True).execute()
        return [cls(**goal) for goal in response.data]

    @classmethod
    async def get_by_id(cls, supabase: Client, goal_id: int) -> Optional["Goal"]:
        """
        Retrieve a single goal by ID.

        Args:
            supabase: Supabase client instance
            goal_id: Goal ID to retrieve

        Returns:
            Goal instance if found, None otherwise
        """
        response = supabase.table("goals").select("*").eq("id", goal_id).execute()

        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    async def update(self, supabase: Client, update_data: GoalUpdate) -> Optional["Goal"]:
        """
        Update this goal with new data.

        Args:
            supabase: Supabase client instance
            update_data: GoalUpdate instance with fields to update

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
            update_dict["status"] = update_data.status.value
        if update_data.target_date is not None:
            update_dict["target_date"] = update_data.target_date.isoformat()

        if not update_dict:
            # Nothing to update, return self
            return self

        response = supabase.table("goals").update(update_dict).eq("id", self.id).execute()

        if response.data and len(response.data) > 0:
            return Goal(**response.data[0])

        return None

    async def delete(self, supabase: Client) -> bool:
        """
        Delete this goal from the database.

        Args:
            supabase: Supabase client instance

        Returns:
            True if successful, False otherwise
        """
        response = supabase.table("goals").delete().eq("id", self.id).execute()
        return True
