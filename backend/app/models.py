from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class GoalStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: GoalStatus = GoalStatus.PENDING
    target_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    target_date: Optional[datetime] = None


class Goal(GoalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
