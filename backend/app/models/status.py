"""
Custom Status Pydantic models (schemas) for user and team status management.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from supabase import Client


class StatusBase(BaseModel):
    """Base status schema with common attributes."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Name of the custom status",
        examples=["Blocked", "In Review", "On Hold", "Done"]
    )
    color: str = Field(
        "#3B82F6",
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Hex color code for the status badge",
        examples=["#EF4444", "#10B981", "#F59E0B"]
    )
    icon: Optional[str] = Field(
        None,
        max_length=50,
        description="Icon identifier for the status",
        examples=["check", "clock", "alert"]
    )
    display_order: int = Field(
        0,
        ge=0,
        description="Order in which the status appears in lists"
    )


class UserStatusCreate(StatusBase):
    """Schema for creating a new user status."""
    pass


class UserStatusUpdate(BaseModel):
    """Schema for updating an existing user status. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Updated name for the status"
    )
    color: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Updated hex color code"
    )
    icon: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated icon identifier"
    )
    display_order: Optional[int] = Field(
        None,
        ge=0,
        description="Updated display order"
    )


class UserStatus(StatusBase):
    """Complete user status schema with database fields."""
    id: int = Field(..., description="Unique identifier for the status")
    user_id: str = Field(..., description="UUID of the user who owns this status")
    created_at: datetime = Field(..., description="Timestamp when the status was created")
    updated_at: datetime = Field(..., description="Timestamp when the status was last updated")

    class Config:
        from_attributes = True


class TeamStatusCreate(StatusBase):
    """Schema for creating a new team status."""
    team_id: int = Field(..., description="ID of the team this status belongs to")


class TeamStatusUpdate(BaseModel):
    """Schema for updating an existing team status. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Updated name for the status"
    )
    color: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Updated hex color code"
    )
    icon: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated icon identifier"
    )
    display_order: Optional[int] = Field(
        None,
        ge=0,
        description="Updated display order"
    )


class TeamStatus(StatusBase):
    """Complete team status schema with database fields."""
    id: int = Field(..., description="Unique identifier for the status")
    team_id: int = Field(..., description="ID of the team this status belongs to")
    created_by: str = Field(..., description="UUID of the user who created this status")
    created_at: datetime = Field(..., description="Timestamp when the status was created")
    updated_at: datetime = Field(..., description="Timestamp when the status was last updated")

    class Config:
        from_attributes = True


# Helper class for combined status responses
class CombinedStatuses(BaseModel):
    """Combined user and team statuses response."""
    user_statuses: List[UserStatus] = Field(
        default_factory=list,
        description="User's personal custom statuses"
    )
    team_statuses: List[TeamStatus] = Field(
        default_factory=list,
        description="Statuses from all teams user belongs to"
    )
    default_statuses: List[str] = Field(
        default=["pending", "in_progress", "completed"],
        description="System default status values"
    )

    class Config:
        from_attributes = True
