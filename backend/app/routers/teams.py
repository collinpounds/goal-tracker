"""
Teams API router with CRUD operations for teams, members, invitations, and notifications.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from supabase import Client
from typing import List
from pydantic import BaseModel
import secrets
import string

from ..models.team import (
    Team, TeamCreate, TeamUpdate,
    TeamMember, TeamMemberCreate, TeamMemberUpdate, TeamMemberWithUser,
    TeamInvitation, TeamInvitationCreate,
    Notification, NotificationCreate,
    GoalTeamAssignment,
    TeamRole, InvitationStatus, NotificationType
)
from ..models.goal import Goal
from ..supabase_client import get_supabase
from ..auth import get_current_user_id, get_current_user_email

router = APIRouter()


class GoalTeamAssignmentRequest(BaseModel):
    """Request model for assigning a goal to teams."""
    team_ids: List[int]


def generate_invite_code(length: int = 12) -> str:
    """Generate a random invite code for team invitations."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# =====================================================
# TEAM ENDPOINTS
# =====================================================

@router.post(
    "/teams",
    response_model=Team,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new team",
    response_description="The created team"
)
async def create_team(
    team_data: TeamCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new team. The creator automatically becomes an owner.

    Supports nested teams up to 3 levels deep (parent_team_id can reference another team).
    """
    try:
        # If this is a nested team, verify the parent exists and user is a member
        if team_data.parent_team_id:
            parent_team = await Team.get_by_id(supabase, team_data.parent_team_id, user_id)
            if not parent_team:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent team not found or you are not a member"
                )

            # Check nesting depth
            if parent_team.nesting_level >= 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum team nesting depth (3 levels) would be exceeded"
                )

        team = await team_data.save(supabase, user_id)
        return team
    except Exception as e:
        if "Maximum team nesting depth" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum team nesting depth (3 levels) exceeded"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create team: {str(e)}"
        )


@router.get(
    "/teams",
    response_model=List[Team],
    summary="List all teams for authenticated user",
    response_description="A list of teams the user is a member of"
)
async def read_teams(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all teams that the authenticated user is a member of.

    Returns teams ordered by creation date (newest first).
    """
    teams = await Team.get_all_for_user(supabase, user_id)
    return teams


@router.get(
    "/teams/{team_id}",
    response_model=Team,
    summary="Get a specific team",
    response_description="The team details"
)
async def read_team(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve details of a specific team.

    User must be a member of the team to view it.
    """
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )
    return team


@router.put(
    "/teams/{team_id}",
    response_model=Team,
    summary="Update a team",
    response_description="The updated team"
)
async def update_team(
    team_id: int,
    update_data: TeamUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update team details (name, description, color).

    Only team owners can update team details.
    """
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    updated_team = await team.update(supabase, update_data, user_id)
    if not updated_team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can update team details"
        )

    return updated_team


@router.delete(
    "/teams/{team_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a team",
    response_description="No content"
)
async def delete_team(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a team permanently.

    Only team owners can delete teams. This will also remove all members and team-goal associations.
    """
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    success = await team.delete(supabase, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can delete teams"
        )

    return None


# =====================================================
# TEAM MEMBER ENDPOINTS
# =====================================================

@router.get(
    "/teams/{team_id}/members",
    response_model=List[TeamMemberWithUser],
    summary="List team members",
    response_description="A list of team members with user information"
)
async def read_team_members(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all members of a specific team with their user information.

    User must be a member of the team to view its members.
    """
    # Verify user is a member of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    # Get team members
    members = await TeamMember.get_all_for_team(supabase, team_id)

    # Fetch user information for each member from auth.users
    members_with_user = []
    for member in members:
        # Query auth.users table for user information
        user_response = supabase.auth.admin.get_user_by_id(member.user_id)

        # Extract user metadata
        email = None
        first_name = None
        last_name = None

        if user_response and user_response.user:
            email = user_response.user.email
            user_metadata = user_response.user.user_metadata or {}
            first_name = user_metadata.get('first_name')
            last_name = user_metadata.get('last_name')

        # Create TeamMemberWithUser instance
        member_dict = member.model_dump()
        member_dict['email'] = email
        member_dict['first_name'] = first_name
        member_dict['last_name'] = last_name

        members_with_user.append(TeamMemberWithUser(**member_dict))

    return members_with_user


@router.post(
    "/teams/{team_id}/members",
    response_model=TeamMember,
    status_code=status.HTTP_201_CREATED,
    summary="Add a member to a team",
    response_description="The added team member"
)
async def add_team_member(
    team_id: int,
    member_user_id: str,  # User ID to add (passed in request body)
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Add a new member to a team.

    Only team owners can add members. The new member will have the 'member' role by default.
    """
    # Verify user is an owner of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    is_owner = await team.is_user_owner(supabase, user_id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can add members"
        )

    # Create the member
    member_data = TeamMemberCreate(
        team_id=team_id,
        user_id=member_user_id,
        role=TeamRole.MEMBER
    )

    try:
        member = await member_data.save(supabase, user_id)

        # Create notification for the new member
        notification = NotificationCreate(
            user_id=member_user_id,
            type=NotificationType.TEAM_MEMBER_ADDED,
            title="Added to a team",
            message=f"You've been added to {team.name}",
            related_id=team_id
        )
        await notification.save(supabase)

        return member
    except Exception as e:
        if "unique_team_membership" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this team"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add member: {str(e)}"
        )


@router.put(
    "/teams/{team_id}/members/{member_user_id}",
    response_model=TeamMember,
    summary="Update a team member's role",
    response_description="The updated team member"
)
async def update_team_member_role(
    team_id: int,
    member_user_id: str,
    role_update: TeamMemberUpdate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a team member's role.

    Only team owners can update member roles.
    """
    # Verify user is an owner of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    is_owner = await team.is_user_owner(supabase, user_id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can update member roles"
        )

    # Find the member
    members = await TeamMember.get_all_for_team(supabase, team_id)
    target_member = next((m for m in members if m.user_id == member_user_id), None)

    if not target_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this team"
        )

    updated_member = await target_member.update_role(supabase, role_update.role)
    return updated_member


@router.delete(
    "/teams/{team_id}/members/{member_user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a member from a team",
    response_description="No content"
)
async def remove_team_member(
    team_id: int,
    member_user_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Remove a member from a team.

    Team owners can remove any member. Members can remove themselves.
    """
    # Verify user is a member of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    # Check if user is owner or removing themselves
    is_owner = await team.is_user_owner(supabase, user_id)
    is_self_removal = (member_user_id == user_id)

    if not is_owner and not is_self_removal:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can remove other members"
        )

    # Find and remove the member
    members = await TeamMember.get_all_for_team(supabase, team_id)
    target_member = next((m for m in members if m.user_id == member_user_id), None)

    if not target_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this team"
        )

    await target_member.remove(supabase)

    # Create notification for the removed member (if not self-removal)
    if not is_self_removal:
        notification = NotificationCreate(
            user_id=member_user_id,
            type=NotificationType.TEAM_MEMBER_REMOVED,
            title="Removed from team",
            message=f"You've been removed from {team.name}",
            related_id=team_id
        )
        await notification.save(supabase)

    return None


# =====================================================
# TEAM INVITATION ENDPOINTS
# =====================================================

@router.post(
    "/teams/{team_id}/invite",
    response_model=TeamInvitation,
    status_code=status.HTTP_201_CREATED,
    summary="Send a team invitation",
    response_description="The created invitation"
)
async def send_team_invitation(
    team_id: int,
    invitation_data: TeamInvitationCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Send an invitation to join a team by email.

    Only team owners can send invitations. Returns an invitation with a unique code
    that can be used to generate a shareable link.
    """
    # Verify user is an owner of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    is_owner = await team.is_user_owner(supabase, user_id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can send invitations"
        )

    # Generate unique invite code
    invite_code = generate_invite_code()

    try:
        invitation = await invitation_data.save(supabase, user_id, invite_code)

        # Try to find user by email and create notification if they exist
        try:
            user_response = supabase.auth.admin.list_users()
            invited_user = next(
                (u for u in user_response if u.email == invitation_data.email),
                None
            )

            if invited_user:
                notification = NotificationCreate(
                    user_id=invited_user.id,
                    type=NotificationType.TEAM_INVITATION,
                    title="Team invitation",
                    message=f"You've been invited to join {team.name}",
                    related_id=invitation.id
                )
                await notification.save(supabase)
        except:
            # If we can't find the user or create notification, that's okay
            pass

        return invitation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create invitation: {str(e)}"
        )


@router.get(
    "/teams/{team_id}/invitations",
    response_model=List[TeamInvitation],
    summary="Get all invitations for a team",
    response_description="A list of invitations sent for this team"
)
async def read_team_invitations(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all invitations sent for a specific team.

    User must be a member of the team to view its invitations.
    """
    # Verify user is a member of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    # Get all invitations for this team
    response = (
        supabase.table("team_invitations")
        .select("*")
        .eq("team_id", team_id)
        .order("created_at", desc=True)
        .execute()
    )

    return [TeamInvitation(**invitation) for invitation in response.data]


@router.get(
    "/invitations",
    response_model=List[TeamInvitation],
    summary="Get user's pending invitations",
    response_description="A list of pending invitations"
)
async def read_invitations(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all pending team invitations for the authenticated user's email.
    """
    # Get user's email
    user_response = supabase.auth.get_user()
    user_email = user_response.user.email if user_response.user else None

    if not user_email:
        return []

    invitations = await TeamInvitation.get_pending_for_email(supabase, user_email)
    return invitations


@router.post(
    "/invitations/{invitation_id}/accept",
    response_model=TeamMember,
    summary="Accept a team invitation",
    response_description="The created team membership"
)
async def accept_invitation(
    invitation_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id),
    user_email: str = Depends(get_current_user_email)
):
    """
    Accept a team invitation and join the team.

    The invitation must be pending and sent to the user's email.
    """
    try:

        # Find the invitation - check both by email match AND if user can access it
        invitation_response = (
            supabase.table("team_invitations")
            .select("*")
            .eq("id", invitation_id)
            .eq("status", InvitationStatus.PENDING.value)
            .execute()
        )

        if not invitation_response.data or len(invitation_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )

        invitation = TeamInvitation(**invitation_response.data[0])

        # Verify the invitation is for this user's email
        if invitation.email.lower() != user_email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This invitation is for {invitation.email}, but you are logged in as {user_email}"
            )

        # Check if invitation is expired
        from datetime import datetime, timezone
        if invitation.expires_at < datetime.now(timezone.utc):
            await invitation.decline(supabase)  # Mark as expired
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )

        # Add user as team member
        member_data = TeamMemberCreate(
            team_id=invitation.team_id,
            user_id=user_id,
            role=TeamRole.MEMBER
        )

        try:
            member = await member_data.save(supabase, invitation.invited_by)
            await invitation.accept(supabase)
            return member
        except Exception as e:
            if "unique_team_membership" in str(e):
                # User is already a member, mark invitation as accepted anyway
                await invitation.accept(supabase)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You are already a member of this team"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to add you to the team: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error accepting invitation: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept invitation: {str(e)}"
        )


@router.post(
    "/invitations/{invitation_id}/decline",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Decline a team invitation",
    response_description="No content"
)
async def decline_invitation(
    invitation_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Decline a team invitation.

    The invitation must be pending and sent to the user's email.
    """
    # Get user's email
    user_response = supabase.auth.get_user()
    user_email = user_response.user.email if user_response.user else None

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not verify user email"
        )

    # Find the invitation
    invitation_response = (
        supabase.table("team_invitations")
        .select("*")
        .eq("id", invitation_id)
        .eq("email", user_email)
        .eq("status", InvitationStatus.PENDING.value)
        .execute()
    )

    if not invitation_response.data or len(invitation_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or already processed"
        )

    invitation = TeamInvitation(**invitation_response.data[0])
    await invitation.decline(supabase)
    return None


@router.get(
    "/invite/{invite_code}",
    response_model=TeamInvitation,
    summary="Get invitation by code",
    response_description="The invitation details"
)
async def get_invitation_by_code(
    invite_code: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get invitation details by invite code (for shareable links).

    Returns the invitation if it exists and is still pending.
    """
    invitation = await TeamInvitation.get_by_code(supabase, invite_code)

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been processed"
        )

    # Check if invitation is expired
    from datetime import datetime, timezone
    if invitation.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )

    return invitation


@router.post(
    "/invite/{invite_code}/join",
    response_model=TeamMember,
    summary="Join team via invite link",
    response_description="The created team membership"
)
async def join_via_invite_code(
    invite_code: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Join a team using an invite code from a shareable link.

    Anyone with the invite code can join if the invitation is still valid.
    """
    invitation = await TeamInvitation.get_by_code(supabase, invite_code)

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been processed"
        )

    # Check if invitation is expired
    from datetime import datetime, timezone
    if invitation.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )

    # Add user as team member
    member_data = TeamMemberCreate(
        team_id=invitation.team_id,
        user_id=user_id,
        role=TeamRole.MEMBER
    )

    try:
        member = await member_data.save(supabase, invitation.invited_by)
        await invitation.accept(supabase)
        return member
    except Exception as e:
        if "unique_team_membership" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already a member of this team"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join team: {str(e)}"
        )


# =====================================================
# TEAM GOAL ENDPOINTS
# =====================================================

@router.get(
    "/teams/{team_id}/goals",
    response_model=List[Goal],
    summary="Get team's goals",
    response_description="A list of goals assigned to the team"
)
async def read_team_goals(
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all goals assigned to a specific team.

    User must be a member of the team to view its goals.
    """
    # Verify user is a member of the team
    team = await Team.get_by_id(supabase, team_id, user_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    # Get goal IDs for this team
    goal_ids = await GoalTeamAssignment.get_goals_for_team(supabase, team_id)

    if not goal_ids:
        return []

    # Fetch all goals
    response = (
        supabase.table("goals")
        .select("*")
        .in_("id", goal_ids)
        .order("created_at", desc=True)
        .execute()
    )

    return [Goal(**goal) for goal in response.data]


@router.post(
    "/goals/{goal_id}/teams",
    status_code=status.HTTP_201_CREATED,
    summary="Assign goal to teams",
    response_description="Success message"
)
async def assign_goal_to_teams(
    goal_id: int,
    assignment_request: GoalTeamAssignmentRequest,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Assign a goal to one or more teams.

    User must own the goal and be a member of all specified teams.
    """
    team_ids = assignment_request.team_ids

    # Verify goal exists and user owns it
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or you do not own it"
        )

    # Verify user is a member of all specified teams
    for team_id in team_ids:
        team = await Team.get_by_id(supabase, team_id, user_id)
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team {team_id} not found or you are not a member"
            )

    # Assign goal to all teams
    for team_id in team_ids:
        assignment = GoalTeamAssignment(goal_id=goal_id, team_id=team_id)
        try:
            await assignment.save(supabase, user_id)
        except Exception as e:
            # If already assigned, that's okay
            if "unique_goal_team_assignment" not in str(e):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to assign goal to team {team_id}: {str(e)}"
                )

    return {"message": f"Goal assigned to {len(team_ids)} team(s)"}


@router.delete(
    "/goals/{goal_id}/teams/{team_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unassign goal from team",
    response_description="No content"
)
async def unassign_goal_from_team(
    goal_id: int,
    team_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Remove a goal from a team.

    User must own the goal to unassign it from teams.
    """
    # Verify goal exists and user owns it
    goal = await Goal.get_by_id(supabase, goal_id, user_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or you do not own it"
        )

    await GoalTeamAssignment.remove(supabase, goal_id, team_id)
    return None


# =====================================================
# NOTIFICATION ENDPOINTS
# =====================================================

@router.get(
    "/notifications",
    response_model=List[Notification],
    summary="Get user's notifications",
    response_description="A list of notifications"
)
async def read_notifications(
    unread_only: bool = False,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieve all notifications for the authenticated user.

    Set unread_only=true to only get unread notifications.
    """
    notifications = await Notification.get_all_for_user(supabase, user_id, unread_only)
    return notifications


@router.put(
    "/notifications/{notification_id}/read",
    response_model=Notification,
    summary="Mark notification as read",
    response_description="The updated notification"
)
async def mark_notification_read(
    notification_id: int,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark a specific notification as read.
    """
    # Get notification
    response = (
        supabase.table("notifications")
        .select("*")
        .eq("id", notification_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification = Notification(**response.data[0])
    await notification.mark_as_read(supabase)

    # Fetch updated notification
    updated_response = (
        supabase.table("notifications")
        .select("*")
        .eq("id", notification_id)
        .execute()
    )

    return Notification(**updated_response.data[0])


@router.put(
    "/notifications/read-all",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Mark all notifications as read",
    response_description="No content"
)
async def mark_all_notifications_read(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark all of the user's unread notifications as read.
    """
    await Notification.mark_all_as_read(supabase, user_id)
    return None
