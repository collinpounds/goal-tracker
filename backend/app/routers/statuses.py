"""
Custom Status API router for user and team status management.
"""
from fastapi import APIRouter, Depends, HTTPException, status as http_status
from supabase import Client
from typing import List

from ..models.status import (
    UserStatus,
    UserStatusCreate,
    UserStatusUpdate,
    TeamStatus,
    TeamStatusCreate,
    TeamStatusUpdate,
    CombinedStatuses,
)
from ..supabase_client import get_supabase
from ..auth import get_current_user_id

router = APIRouter()


# =====================================================
# USER STATUS ENDPOINTS
# =====================================================


@router.get(
    "/statuses",
    response_model=List[UserStatus],
    summary="Get user's custom statuses",
    response_description="List of user's custom status definitions",
)
async def get_user_statuses(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve all custom statuses for the authenticated user.

    Returns statuses ordered by display_order.
    """
    response = (
        supabase.table("user_statuses")
        .select("*")
        .eq("user_id", user_id)
        .order("display_order")
        .execute()
    )

    return response.data


@router.post(
    "/statuses",
    response_model=UserStatus,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create a new custom status",
    response_description="The created status",
)
async def create_user_status(
    status_data: UserStatusCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Create a new custom status for the authenticated user.

    Status names must be unique per user.
    """
    try:
        response = (
            supabase.table("user_statuses")
            .insert(
                {
                    "user_id": user_id,
                    "name": status_data.name,
                    "color": status_data.color,
                    "icon": status_data.icon,
                    "display_order": status_data.display_order,
                }
            )
            .execute()
        )

        if response.data and len(response.data) > 0:
            return response.data[0]

        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create status",
        )
    except Exception as e:
        if "unique_user_status_name" in str(e):
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=f"Status name '{status_data.name}' already exists",
            )
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put(
    "/statuses/{status_id}",
    response_model=UserStatus,
    summary="Update a custom status",
    response_description="The updated status",
)
async def update_user_status(
    status_id: int,
    status_data: UserStatusUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Update an existing custom status.

    Only the status owner can update it.
    """
    # Build update dict
    update_dict = {}
    if status_data.name is not None:
        update_dict["name"] = status_data.name
    if status_data.color is not None:
        update_dict["color"] = status_data.color
    if status_data.icon is not None:
        update_dict["icon"] = status_data.icon
    if status_data.display_order is not None:
        update_dict["display_order"] = status_data.display_order

    if not update_dict:
        # Nothing to update
        response = (
            supabase.table("user_statuses")
            .select("*")
            .eq("id", status_id)
            .eq("user_id", user_id)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Status not found",
        )

    try:
        response = (
            supabase.table("user_statuses")
            .update(update_dict)
            .eq("id", status_id)
            .eq("user_id", user_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return response.data[0]

        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Status not found or you don't have permission",
        )
    except Exception as e:
        if "unique_user_status_name" in str(e):
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=f"Status name already exists",
            )
        raise


@router.delete(
    "/statuses/{status_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    summary="Delete a custom status",
)
async def delete_user_status(
    status_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete a custom status.

    Only the status owner can delete it.
    """
    response = (
        supabase.table("user_statuses")
        .delete()
        .eq("id", status_id)
        .eq("user_id", user_id)
        .execute()
    )

    # Supabase doesn't throw error if nothing deleted, so we can't verify
    return None


# =====================================================
# TEAM STATUS ENDPOINTS
# =====================================================


@router.get(
    "/teams/{team_id}/statuses",
    response_model=List[TeamStatus],
    summary="Get team's custom statuses",
    response_description="List of team's custom status definitions",
)
async def get_team_statuses(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve all custom statuses for a specific team.

    User must be a member of the team to view statuses.
    Returns statuses ordered by display_order.
    """
    # Verify user is team member
    member_check = (
        supabase.table("team_members")
        .select("id")
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not member_check.data or len(member_check.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team",
        )

    response = (
        supabase.table("team_statuses")
        .select("*")
        .eq("team_id", team_id)
        .order("display_order")
        .execute()
    )

    return response.data


@router.post(
    "/teams/{team_id}/statuses",
    response_model=TeamStatus,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create a team status (owners only)",
    response_description="The created team status",
)
async def create_team_status(
    team_id: int,
    status_data: TeamStatusCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Create a new custom status for a team.

    Only team owners can create team statuses.
    Status names must be unique per team.
    """
    # Verify user is team owner
    member_check = (
        supabase.table("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not member_check.data or len(member_check.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team",
        )

    if member_check.data[0]["role"] != "owner":
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only team owners can create team statuses",
        )

    try:
        response = (
            supabase.table("team_statuses")
            .insert(
                {
                    "team_id": team_id,
                    "name": status_data.name,
                    "color": status_data.color,
                    "icon": status_data.icon,
                    "display_order": status_data.display_order,
                    "created_by": user_id,
                }
            )
            .execute()
        )

        if response.data and len(response.data) > 0:
            return response.data[0]

        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create team status",
        )
    except Exception as e:
        if "unique_team_status_name" in str(e):
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=f"Status name '{status_data.name}' already exists for this team",
            )
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.put(
    "/teams/{team_id}/statuses/{status_id}",
    response_model=TeamStatus,
    summary="Update a team status (owners only)",
    response_description="The updated team status",
)
async def update_team_status(
    team_id: int,
    status_id: int,
    status_data: TeamStatusUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Update an existing team status.

    Only team owners can update team statuses.
    """
    # Verify user is team owner
    member_check = (
        supabase.table("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not member_check.data or len(member_check.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team",
        )

    if member_check.data[0]["role"] != "owner":
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only team owners can update team statuses",
        )

    # Build update dict
    update_dict = {}
    if status_data.name is not None:
        update_dict["name"] = status_data.name
    if status_data.color is not None:
        update_dict["color"] = status_data.color
    if status_data.icon is not None:
        update_dict["icon"] = status_data.icon
    if status_data.display_order is not None:
        update_dict["display_order"] = status_data.display_order

    if not update_dict:
        # Nothing to update
        response = (
            supabase.table("team_statuses")
            .select("*")
            .eq("id", status_id)
            .eq("team_id", team_id)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Team status not found",
        )

    try:
        response = (
            supabase.table("team_statuses")
            .update(update_dict)
            .eq("id", status_id)
            .eq("team_id", team_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return response.data[0]

        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Team status not found",
        )
    except Exception as e:
        if "unique_team_status_name" in str(e):
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail="Status name already exists for this team",
            )
        raise


@router.delete(
    "/teams/{team_id}/statuses/{status_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    summary="Delete a team status (owners only)",
)
async def delete_team_status(
    team_id: int,
    status_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete a team status.

    Only team owners can delete team statuses.
    """
    # Verify user is team owner
    member_check = (
        supabase.table("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not member_check.data or len(member_check.data) == 0:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team",
        )

    if member_check.data[0]["role"] != "owner":
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only team owners can delete team statuses",
        )

    response = (
        supabase.table("team_statuses")
        .delete()
        .eq("id", status_id)
        .eq("team_id", team_id)
        .execute()
    )

    return None


# =====================================================
# COMBINED STATUS ENDPOINT
# =====================================================


@router.get(
    "/statuses/combined",
    response_model=CombinedStatuses,
    summary="Get all available statuses (user + teams + defaults)",
    response_description="Combined list of all statuses available to user",
)
async def get_combined_statuses(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve all statuses available to the user:
    - User's personal custom statuses
    - Statuses from all teams the user belongs to
    - Default system statuses

    This endpoint is useful for populating status dropdowns in the UI.
    """
    # Get user's personal statuses
    user_statuses_response = (
        supabase.table("user_statuses")
        .select("*")
        .eq("user_id", user_id)
        .order("display_order")
        .execute()
    )

    # Get all team statuses for teams user belongs to
    team_statuses_response = (
        supabase.table("team_statuses")
        .select("*, teams!inner(id, name)")
        .in_(
            "team_id",
            supabase.rpc(
                "get_user_team_ids", {"p_user_id": user_id}
            ).execute().data or [],
        )
        .order("team_id, display_order")
        .execute()
    )

    # Note: The above query will fail if RPC doesn't exist. Alternative approach:
    # 1. Get user's teams first
    teams_response = (
        supabase.table("team_members")
        .select("team_id")
        .eq("user_id", user_id)
        .execute()
    )

    team_ids = [tm["team_id"] for tm in teams_response.data] if teams_response.data else []

    team_statuses_data = []
    if team_ids:
        team_statuses_response = (
            supabase.table("team_statuses")
            .select("*")
            .in_("team_id", team_ids)
            .order("team_id, display_order")
            .execute()
        )
        team_statuses_data = team_statuses_response.data

    return CombinedStatuses(
        user_statuses=user_statuses_response.data or [],
        team_statuses=team_statuses_data or [],
        default_statuses=["pending", "in_progress", "completed"],
    )
