"""
Goal File Attachments API router.
Handles file uploads, downloads, and deletion using Supabase Storage.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status as http_status
from supabase import Client
from typing import List
import uuid
from datetime import datetime, timedelta

from ..models.goal_file import GoalFile, GoalFileUploadResponse
from ..supabase_client import get_supabase
from ..auth import get_current_user_id

router = APIRouter()


async def verify_goal_access(
    goal_id: int,
    user_id: str,
    supabase: Client,
    require_write: bool = False
) -> dict:
    """
    Verify user has access to a goal.

    Args:
        goal_id: ID of the goal to check
        user_id: UUID of the user
        supabase: Supabase client
        require_write: If True, verify user can modify goal (owner or team member)

    Returns:
        Goal data if user has access

    Raises:
        HTTPException if access denied or goal not found
    """
    # Get goal data
    goal_response = (
        supabase.table("goals")
        .select("id, user_id, is_public")
        .eq("id", goal_id)
        .execute()
    )

    if not goal_response.data or len(goal_response.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    goal = goal_response.data[0]

    # Check if user owns the goal
    if goal["user_id"] == user_id:
        return goal

    # If write access required, check team membership
    if require_write:
        # Check if user is member of any team this goal is assigned to
        team_check = (
            supabase.table("goal_teams")
            .select("team_id, team_members!inner(user_id)")
            .eq("goal_id", goal_id)
            .eq("team_members.user_id", user_id)
            .execute()
        )

        if team_check.data and len(team_check.data) > 0:
            return goal

        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload files to this goal"
        )

    # For read access, check if goal is public or user is team member
    if goal["is_public"]:
        return goal

    # Check team membership
    team_check = (
        supabase.table("goal_teams")
        .select("team_id, team_members!inner(user_id)")
        .eq("goal_id", goal_id)
        .eq("team_members.user_id", user_id)
        .execute()
    )

    if team_check.data and len(team_check.data) > 0:
        return goal

    raise HTTPException(
        status_code=http_status.HTTP_403_FORBIDDEN,
        detail="You don't have access to this goal"
    )


@router.get(
    "/goals/{goal_id}/files",
    response_model=List[GoalFile],
    summary="List files for a goal",
    response_description="List of file attachments",
)
async def list_goal_files(
    goal_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve all file attachments for a goal.

    User must have access to the goal (owner, team member, or public goal).
    """
    # Verify access
    await verify_goal_access(goal_id, user_id, supabase, require_write=False)

    # Get files
    response = (
        supabase.table("goal_files")
        .select("*")
        .eq("goal_id", goal_id)
        .order("uploaded_at", desc=True)
        .execute()
    )

    return response.data


@router.post(
    "/goals/{goal_id}/files",
    response_model=GoalFileUploadResponse,
    status_code=http_status.HTTP_201_CREATED,
    summary="Upload a file to a goal",
    response_description="The uploaded file record with download URL",
)
async def upload_goal_file(
    goal_id: int,
    file: UploadFile = File(...),
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload a file attachment to a goal.

    **Constraints:**
    - Maximum file size: 10MB
    - Maximum 10 files per goal
    - User must be goal owner or team member

    **Returns:** File record with a signed download URL (valid for 1 hour)
    """
    # Verify write access
    await verify_goal_access(goal_id, user_id, supabase, require_write=True)

    # Check file count limit (max 10 files per goal)
    files_count_response = (
        supabase.table("goal_files")
        .select("id", count="exact")
        .eq("goal_id", goal_id)
        .execute()
    )

    if files_count_response.count >= 10:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 10 files per goal exceeded"
        )

    # Read file content
    file_content = await file.read()
    file_size = len(file_content)

    # Check file size (10MB = 10485760 bytes)
    if file_size > 10485760:
        raise HTTPException(
            status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10MB limit"
        )

    # Generate unique file path
    file_extension = ""
    if file.filename and "." in file.filename:
        file_extension = file.filename.rsplit(".", 1)[1]

    unique_filename = f"{goal_id}/{uuid.uuid4()}"
    if file_extension:
        unique_filename += f".{file_extension}"

    try:
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("goal-files").upload(
            path=unique_filename,
            file=file_content,
            file_options={
                "content-type": file.content_type or "application/octet-stream",
                "upsert": "false"
            }
        )

        # Create database record
        file_record = {
            "goal_id": goal_id,
            "file_name": file.filename or "unnamed",
            "file_path": unique_filename,
            "file_size": file_size,
            "mime_type": file.content_type,
            "uploaded_by": user_id,
        }

        db_response = (
            supabase.table("goal_files")
            .insert(file_record)
            .execute()
        )

        if not db_response.data or len(db_response.data) == 0:
            # Rollback: delete uploaded file
            supabase.storage.from_("goal-files").remove([unique_filename])
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create file record"
            )

        created_file = db_response.data[0]

        # Generate signed download URL (valid for 1 hour)
        download_url = supabase.storage.from_("goal-files").create_signed_url(
            path=unique_filename,
            expires_in=3600  # 1 hour
        )

        return GoalFileUploadResponse(
            file=GoalFile(**created_file),
            download_url=download_url.get("signedURL") if download_url else None
        )

    except Exception as e:
        # Clean up if anything fails
        try:
            supabase.storage.from_("goal-files").remove([unique_filename])
        except:
            pass

        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


@router.get(
    "/goals/{goal_id}/files/{file_id}/download",
    summary="Get download URL for a file",
    response_description="Signed URL for downloading the file",
)
async def get_file_download_url(
    goal_id: int,
    file_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate a signed download URL for a file.

    The URL is valid for 1 hour.
    User must have access to the goal.
    """
    # Verify access
    await verify_goal_access(goal_id, user_id, supabase, require_write=False)

    # Get file record
    file_response = (
        supabase.table("goal_files")
        .select("*")
        .eq("id", file_id)
        .eq("goal_id", goal_id)
        .execute()
    )

    if not file_response.data or len(file_response.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_record = file_response.data[0]

    try:
        # Generate signed URL
        download_url = supabase.storage.from_("goal-files").create_signed_url(
            path=file_record["file_path"],
            expires_in=3600  # 1 hour
        )

        return {
            "file_id": file_id,
            "file_name": file_record["file_name"],
            "download_url": download_url.get("signedURL") if download_url else None,
            "expires_in": 3600
        }
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )


@router.delete(
    "/goals/{goal_id}/files/{file_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    summary="Delete a file",
)
async def delete_goal_file(
    goal_id: int,
    file_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete a file attachment.

    User must be the uploader or the goal owner.
    """
    # Get file record
    file_response = (
        supabase.table("goal_files")
        .select("*, goals!inner(user_id)")
        .eq("id", file_id)
        .eq("goal_id", goal_id)
        .execute()
    )

    if not file_response.data or len(file_response.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_record = file_response.data[0]

    # Check if user is uploader or goal owner
    if file_record["uploaded_by"] != user_id and file_record["goals"]["user_id"] != user_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this file"
        )

    try:
        # Delete from storage
        supabase.storage.from_("goal-files").remove([file_record["file_path"]])

        # Delete database record
        supabase.table("goal_files").delete().eq("id", file_id).execute()

        return None

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
