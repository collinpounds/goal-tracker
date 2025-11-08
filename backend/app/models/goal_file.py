"""
Goal File Attachment Pydantic models (schemas).
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GoalFileBase(BaseModel):
    """Base goal file schema with common attributes."""
    file_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Name of the uploaded file",
        examples=["document.pdf", "screenshot.png", "requirements.docx"]
    )
    file_size: int = Field(
        ...,
        gt=0,
        le=10485760,  # 10MB in bytes
        description="Size of the file in bytes (max 10MB)"
    )
    mime_type: Optional[str] = Field(
        None,
        max_length=127,
        description="MIME type of the file",
        examples=["application/pdf", "image/png", "text/plain"]
    )


class GoalFileCreate(GoalFileBase):
    """Schema for creating a new goal file record (after upload to storage)."""
    goal_id: int = Field(..., description="ID of the goal this file belongs to")
    file_path: str = Field(..., description="Path to file in Supabase Storage")


class GoalFile(GoalFileBase):
    """Complete goal file schema with database fields."""
    id: int = Field(..., description="Unique identifier for the file")
    goal_id: int = Field(..., description="ID of the goal this file belongs to")
    file_path: str = Field(..., description="Path to file in Supabase Storage")
    uploaded_by: str = Field(..., description="UUID of the user who uploaded the file")
    uploaded_at: datetime = Field(..., description="Timestamp when the file was uploaded")

    class Config:
        from_attributes = True


class GoalFileUploadResponse(BaseModel):
    """Response after successful file upload."""
    file: GoalFile = Field(..., description="Created file record")
    download_url: Optional[str] = Field(
        None,
        description="Signed URL for downloading the file (valid for limited time)"
    )

    class Config:
        from_attributes = True
