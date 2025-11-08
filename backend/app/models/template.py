"""
Goal Template Pydantic models (schemas).
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RecurrenceType(str, Enum):
    """Recurrence type enumeration."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TemplateBase(BaseModel):
    """Base template schema with common attributes."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Name of the template",
        examples=["Daily Standup", "Weekly Review", "Monthly Goals"]
    )
    title_template: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Template for goal title",
        examples=["Daily Standup - {date}", "Weekly Review"]
    )
    description_template: Optional[str] = Field(
        None,
        description="Template for goal description",
        examples=["Review progress on current sprint goals"]
    )
    default_status: Optional[str] = Field(
        None,
        max_length=50,
        description="Default status for goals created from this template"
    )
    is_recurring: bool = Field(
        False,
        description="Whether goals from this template should recur"
    )
    recurrence_type: Optional[RecurrenceType] = Field(
        None,
        description="How often the goal recurs (daily, weekly, monthly)"
    )
    recurrence_interval: Optional[int] = Field(
        1,
        ge=1,
        le=365,
        description="Interval for recurrence (e.g., every N days/weeks/months)"
    )
    is_shared: bool = Field(
        False,
        description="Whether other users can use this template"
    )


class TemplateCreate(TemplateBase):
    """Schema for creating a new template."""
    category_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="Default category IDs to assign to goals created from this template"
    )
    team_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="Default team IDs to assign to goals created from this template"
    )


class TemplateUpdate(BaseModel):
    """Schema for updating an existing template. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Updated template name"
    )
    title_template: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated title template"
    )
    description_template: Optional[str] = Field(
        None,
        description="Updated description template"
    )
    default_status: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated default status"
    )
    is_recurring: Optional[bool] = Field(
        None,
        description="Updated recurring flag"
    )
    recurrence_type: Optional[RecurrenceType] = Field(
        None,
        description="Updated recurrence type"
    )
    recurrence_interval: Optional[int] = Field(
        None,
        ge=1,
        le=365,
        description="Updated recurrence interval"
    )
    is_shared: Optional[bool] = Field(
        None,
        description="Updated sharing flag"
    )
    category_ids: Optional[List[int]] = Field(
        None,
        description="Updated category IDs"
    )
    team_ids: Optional[List[int]] = Field(
        None,
        description="Updated team IDs"
    )


class Template(TemplateBase):
    """Complete template schema with database fields and relationships."""
    id: int = Field(..., description="Unique identifier for the template")
    user_id: str = Field(..., description="UUID of the user who owns this template")
    created_at: datetime = Field(..., description="Timestamp when the template was created")
    updated_at: datetime = Field(..., description="Timestamp when the template was last updated")
    categories: Optional[List[dict]] = Field(
        default_factory=list,
        description="Default categories for this template"
    )
    teams: Optional[List[dict]] = Field(
        default_factory=list,
        description="Default teams for this template"
    )

    class Config:
        from_attributes = True


class TemplateInstantiate(BaseModel):
    """Schema for instantiating a goal from a template."""
    template_id: int = Field(..., description="ID of the template to instantiate")
    title_override: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Override the template's title (optional)"
    )
    description_override: Optional[str] = Field(
        None,
        description="Override the template's description (optional)"
    )
    target_date: Optional[datetime] = Field(
        None,
        description="Target date for the new goal"
    )
    additional_category_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="Additional categories to add beyond template defaults"
    )
    additional_team_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="Additional teams to add beyond template defaults"
    )
