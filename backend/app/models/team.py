"""
Team Pydantic models (schemas) with CRUD methods.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from supabase import Client


class TeamRole(str, Enum):
    """Team member role enumeration."""
    OWNER = "owner"
    MEMBER = "member"


class InvitationStatus(str, Enum):
    """Team invitation status enumeration."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class NotificationType(str, Enum):
    """Notification type enumeration."""
    TEAM_INVITATION = "team_invitation"
    TEAM_MEMBER_ADDED = "team_member_added"
    TEAM_MEMBER_REMOVED = "team_member_removed"
    TEAM_GOAL_ASSIGNED = "team_goal_assigned"
    TEAM_GOAL_COMPLETED = "team_goal_completed"
    TEAM_DELETED = "team_deleted"


# =====================================================
# TEAM MODELS
# =====================================================

class TeamBase(BaseModel):
    """Base team schema with common attributes."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the team",
        examples=["Engineering Team", "Product Design", "Marketing"]
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description of the team",
        examples=["Our main engineering team working on the core product"]
    )
    color_theme: str = Field(
        "#3B82F6",
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Hex color code for team theme (predefined palette)",
        examples=["#3B82F6", "#10B981", "#F59E0B"]
    )
    parent_team_id: Optional[int] = Field(
        None,
        description="Parent team ID for nested teams (null for top-level teams)",
        examples=[None, 1, 42]
    )


class TeamCreate(TeamBase):
    """Schema for creating a new team."""

    async def save(self, supabase: Client, user_id: str) -> "Team":
        """
        Create a new team in the database.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user creating the team

        Returns:
            Created Team instance
        """
        team_data = {
            "name": self.name,
            "description": self.description,
            "color_theme": self.color_theme,
            "created_by": user_id,
            "parent_team_id": self.parent_team_id,
        }

        response = supabase.table("teams").insert(team_data).execute()

        if response.data and len(response.data) > 0:
            return Team(**response.data[0])

        raise Exception("Failed to create team")


class TeamUpdate(BaseModel):
    """Schema for updating an existing team. All fields are optional."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Updated name for the team",
        examples=["Engineering Team v2"]
    )
    description: Optional[str] = Field(
        None,
        description="Updated description for the team"
    )
    color_theme: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Updated color theme for the team",
        examples=["#10B981"]
    )


class Team(TeamBase):
    """Complete team schema with database fields and CRUD methods."""
    id: int = Field(
        ...,
        description="Unique identifier for the team (auto-generated)",
        examples=[1, 42, 123]
    )
    created_by: str = Field(
        ...,
        description="UUID of the user who created this team",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    nesting_level: int = Field(
        ...,
        ge=0,
        le=2,
        description="Nesting depth level (0-2, max 3 levels total)",
        examples=[0, 1, 2]
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the team was created (auto-generated)",
        examples=["2025-01-15T10:30:00Z"]
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when the team was last updated",
        examples=["2025-01-15T10:30:00Z"]
    )

    class Config:
        from_attributes = True

    @classmethod
    async def get_all_for_user(cls, supabase: Client, user_id: str) -> List["Team"]:
        """
        Retrieve all teams a user is a member of, ordered by created_at descending.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user

        Returns:
            List of Team instances the user belongs to
        """
        # Get all teams where user is a member
        response = (
            supabase.table("teams")
            .select("*, team_members!inner(*)")
            .eq("team_members.user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [cls(**team) for team in response.data]

    @classmethod
    async def get_by_id(cls, supabase: Client, team_id: int, user_id: str) -> Optional["Team"]:
        """
        Retrieve a single team by ID if user is a member.

        Args:
            supabase: Supabase client instance
            team_id: Team ID to retrieve
            user_id: UUID of the user

        Returns:
            Team instance if found and user is member, None otherwise
        """
        # Check if user is a member of the team
        member_response = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", team_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not member_response.data or len(member_response.data) == 0:
            return None

        # Get team details
        response = (
            supabase.table("teams")
            .select("*")
            .eq("id", team_id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    async def update(self, supabase: Client, update_data: TeamUpdate, user_id: str) -> Optional["Team"]:
        """
        Update this team with new data.

        Args:
            supabase: Supabase client instance
            update_data: TeamUpdate instance with fields to update
            user_id: UUID of the user updating the team (must be owner)

        Returns:
            Updated Team instance if successful, None otherwise
        """
        # Build update data, excluding unset fields
        update_dict = {}

        if update_data.name is not None:
            update_dict["name"] = update_data.name
        if update_data.description is not None:
            update_dict["description"] = update_data.description
        if update_data.color_theme is not None:
            update_dict["color_theme"] = update_data.color_theme

        if not update_dict:
            # Nothing to update, return self
            return self

        # Verify user is owner before updating
        is_owner = await self.is_user_owner(supabase, user_id)
        if not is_owner:
            return None

        response = (
            supabase.table("teams")
            .update(update_dict)
            .eq("id", self.id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return Team(**response.data[0])

        return None

    async def delete(self, supabase: Client, user_id: str) -> bool:
        """
        Delete this team from the database.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user deleting the team (must be owner)

        Returns:
            True if successful, False otherwise
        """
        # Verify user is owner before deleting
        is_owner = await self.is_user_owner(supabase, user_id)
        if not is_owner:
            return False

        response = (
            supabase.table("teams")
            .delete()
            .eq("id", self.id)
            .execute()
        )
        return True

    async def is_user_owner(self, supabase: Client, user_id: str) -> bool:
        """
        Check if a user is an owner of this team.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user to check

        Returns:
            True if user is owner, False otherwise
        """
        response = (
            supabase.table("team_members")
            .select("role")
            .eq("team_id", self.id)
            .eq("user_id", user_id)
            .eq("role", TeamRole.OWNER.value)
            .execute()
        )
        return response.data and len(response.data) > 0

    async def is_user_member(self, supabase: Client, user_id: str) -> bool:
        """
        Check if a user is a member of this team (any role).

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user to check

        Returns:
            True if user is member, False otherwise
        """
        response = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", self.id)
            .eq("user_id", user_id)
            .execute()
        )
        return response.data and len(response.data) > 0


# =====================================================
# TEAM MEMBER MODELS
# =====================================================

class TeamMemberBase(BaseModel):
    """Base team member schema."""
    team_id: int = Field(
        ...,
        description="Team ID",
        examples=[1, 42]
    )
    user_id: str = Field(
        ...,
        description="UUID of the user",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    role: TeamRole = Field(
        TeamRole.MEMBER,
        description="Role of the member in the team"
    )


class TeamMemberCreate(TeamMemberBase):
    """Schema for adding a new team member."""

    async def save(self, supabase: Client, invited_by: str) -> "TeamMember":
        """
        Add a new member to a team.

        Args:
            supabase: Supabase client instance
            invited_by: UUID of the user adding the member

        Returns:
            Created TeamMember instance
        """
        member_data = {
            "team_id": self.team_id,
            "user_id": self.user_id,
            "role": self.role.value,
            "invited_by": invited_by,
        }

        response = supabase.table("team_members").insert(member_data).execute()

        if response.data and len(response.data) > 0:
            return TeamMember(**response.data[0])

        raise Exception("Failed to add team member")


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member's role."""
    role: TeamRole = Field(
        ...,
        description="Updated role for the team member"
    )


class TeamMember(TeamMemberBase):
    """Complete team member schema with database fields."""
    id: int = Field(
        ...,
        description="Unique identifier for the team membership",
        examples=[1, 42]
    )
    invited_by: Optional[str] = Field(
        None,
        description="UUID of the user who invited this member",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    joined_at: datetime = Field(
        ...,
        description="Timestamp when the member joined",
        examples=["2025-01-15T10:30:00Z"]
    )

    class Config:
        from_attributes = True

    @classmethod
    async def get_all_for_team(cls, supabase: Client, team_id: int) -> List["TeamMember"]:
        """
        Retrieve all members of a specific team.

        Args:
            supabase: Supabase client instance
            team_id: Team ID

        Returns:
            List of TeamMember instances
        """
        response = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", team_id)
            .order("joined_at", desc=False)
            .execute()
        )
        return [cls(**member) for member in response.data]

    async def update_role(self, supabase: Client, new_role: TeamRole) -> Optional["TeamMember"]:
        """
        Update this member's role.

        Args:
            supabase: Supabase client instance
            new_role: New role for the member

        Returns:
            Updated TeamMember instance if successful, None otherwise
        """
        response = (
            supabase.table("team_members")
            .update({"role": new_role.value})
            .eq("id", self.id)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return TeamMember(**response.data[0])
        return None

    async def remove(self, supabase: Client) -> bool:
        """
        Remove this member from the team.

        Args:
            supabase: Supabase client instance

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("team_members")
            .delete()
            .eq("id", self.id)
            .execute()
        )
        return True


# =====================================================
# TEAM INVITATION MODELS
# =====================================================

class TeamInvitationBase(BaseModel):
    """Base team invitation schema."""
    team_id: int = Field(
        ...,
        description="Team ID",
        examples=[1, 42]
    )
    email: str = Field(
        ...,
        description="Email address to invite",
        examples=["user@example.com"]
    )


class TeamInvitationCreate(TeamInvitationBase):
    """Schema for creating a new team invitation."""

    async def save(self, supabase: Client, invited_by: str, invite_code: str) -> "TeamInvitation":
        """
        Create a new team invitation.

        Args:
            supabase: Supabase client instance
            invited_by: UUID of the user sending the invitation
            invite_code: Unique invite code

        Returns:
            Created TeamInvitation instance
        """
        invitation_data = {
            "team_id": self.team_id,
            "email": self.email,
            "invite_code": invite_code,
            "invited_by": invited_by,
            "status": InvitationStatus.PENDING.value,
        }

        response = supabase.table("team_invitations").insert(invitation_data).execute()

        if response.data and len(response.data) > 0:
            return TeamInvitation(**response.data[0])

        raise Exception("Failed to create team invitation")


class TeamInvitation(TeamInvitationBase):
    """Complete team invitation schema with database fields."""
    id: int = Field(
        ...,
        description="Unique identifier for the invitation",
        examples=[1, 42]
    )
    invite_code: str = Field(
        ...,
        description="Unique code for shareable invite link",
        examples=["abc123xyz"]
    )
    invited_by: str = Field(
        ...,
        description="UUID of the user who sent the invitation",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    status: InvitationStatus = Field(
        ...,
        description="Current status of the invitation"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the invitation was created",
        examples=["2025-01-15T10:30:00Z"]
    )
    expires_at: datetime = Field(
        ...,
        description="Timestamp when the invitation expires",
        examples=["2025-01-22T10:30:00Z"]
    )

    class Config:
        from_attributes = True

    @classmethod
    async def get_by_code(cls, supabase: Client, invite_code: str) -> Optional["TeamInvitation"]:
        """
        Retrieve an invitation by its unique code.

        Args:
            supabase: Supabase client instance
            invite_code: Unique invite code

        Returns:
            TeamInvitation instance if found, None otherwise
        """
        response = (
            supabase.table("team_invitations")
            .select("*")
            .eq("invite_code", invite_code)
            .execute()
        )

        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    @classmethod
    async def get_pending_for_email(cls, supabase: Client, email: str) -> List["TeamInvitation"]:
        """
        Retrieve all pending invitations for an email address.

        Args:
            supabase: Supabase client instance
            email: Email address

        Returns:
            List of pending TeamInvitation instances
        """
        response = (
            supabase.table("team_invitations")
            .select("*")
            .eq("email", email)
            .eq("status", InvitationStatus.PENDING.value)
            .order("created_at", desc=True)
            .execute()
        )
        return [cls(**invitation) for invitation in response.data]

    async def accept(self, supabase: Client) -> bool:
        """
        Mark this invitation as accepted.

        Args:
            supabase: Supabase client instance

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("team_invitations")
            .update({"status": InvitationStatus.ACCEPTED.value})
            .eq("id", self.id)
            .execute()
        )
        return response.data and len(response.data) > 0

    async def decline(self, supabase: Client) -> bool:
        """
        Mark this invitation as declined.

        Args:
            supabase: Supabase client instance

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("team_invitations")
            .update({"status": InvitationStatus.DECLINED.value})
            .eq("id", self.id)
            .execute()
        )
        return response.data and len(response.data) > 0


# =====================================================
# NOTIFICATION MODELS
# =====================================================

class NotificationBase(BaseModel):
    """Base notification schema."""
    user_id: str = Field(
        ...,
        description="UUID of the user receiving the notification",
        examples=["550e8400-e29b-41d4-a716-446655440000"]
    )
    type: NotificationType = Field(
        ...,
        description="Type of notification"
    )
    title: str = Field(
        ...,
        max_length=200,
        description="Notification title",
        examples=["You've been invited to a team"]
    )
    message: str = Field(
        ...,
        description="Notification message",
        examples=["John Doe invited you to join the Engineering Team"]
    )
    related_id: Optional[int] = Field(
        None,
        description="ID of related entity (invitation, team, goal, etc.)",
        examples=[1, 42]
    )


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification."""

    async def save(self, supabase: Client) -> "Notification":
        """
        Create a new notification.

        Args:
            supabase: Supabase client instance

        Returns:
            Created Notification instance
        """
        notification_data = {
            "user_id": self.user_id,
            "type": self.type.value,
            "title": self.title,
            "message": self.message,
            "related_id": self.related_id,
        }

        response = supabase.table("notifications").insert(notification_data).execute()

        if response.data and len(response.data) > 0:
            return Notification(**response.data[0])

        raise Exception("Failed to create notification")


class Notification(NotificationBase):
    """Complete notification schema with database fields."""
    id: int = Field(
        ...,
        description="Unique identifier for the notification",
        examples=[1, 42]
    )
    read: bool = Field(
        False,
        description="Whether the notification has been read"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the notification was created",
        examples=["2025-01-15T10:30:00Z"]
    )

    class Config:
        from_attributes = True

    @classmethod
    async def get_all_for_user(cls, supabase: Client, user_id: str, unread_only: bool = False) -> List["Notification"]:
        """
        Retrieve all notifications for a user.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user
            unread_only: If True, only return unread notifications

        Returns:
            List of Notification instances
        """
        query = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
        )

        if unread_only:
            query = query.eq("read", False)

        response = query.order("created_at", desc=True).execute()
        return [cls(**notification) for notification in response.data]

    async def mark_as_read(self, supabase: Client) -> bool:
        """
        Mark this notification as read.

        Args:
            supabase: Supabase client instance

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("notifications")
            .update({"read": True})
            .eq("id", self.id)
            .execute()
        )
        return response.data and len(response.data) > 0

    @classmethod
    async def mark_all_as_read(cls, supabase: Client, user_id: str) -> bool:
        """
        Mark all notifications as read for a user.

        Args:
            supabase: Supabase client instance
            user_id: UUID of the user

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("notifications")
            .update({"read": True})
            .eq("user_id", user_id)
            .eq("read", False)
            .execute()
        )
        return True


# =====================================================
# GOAL-TEAM ASSOCIATION MODELS
# =====================================================

class GoalTeamAssignment(BaseModel):
    """Schema for assigning a goal to a team."""
    goal_id: int = Field(
        ...,
        description="Goal ID",
        examples=[1, 42]
    )
    team_id: int = Field(
        ...,
        description="Team ID",
        examples=[1, 42]
    )

    async def save(self, supabase: Client, assigned_by: str) -> bool:
        """
        Assign a goal to a team.

        Args:
            supabase: Supabase client instance
            assigned_by: UUID of the user making the assignment

        Returns:
            True if successful, False otherwise
        """
        assignment_data = {
            "goal_id": self.goal_id,
            "team_id": self.team_id,
            "assigned_by": assigned_by,
        }

        response = supabase.table("goal_teams").insert(assignment_data).execute()
        return response.data and len(response.data) > 0

    @classmethod
    async def remove(cls, supabase: Client, goal_id: int, team_id: int) -> bool:
        """
        Remove a goal from a team.

        Args:
            supabase: Supabase client instance
            goal_id: Goal ID
            team_id: Team ID

        Returns:
            True if successful, False otherwise
        """
        response = (
            supabase.table("goal_teams")
            .delete()
            .eq("goal_id", goal_id)
            .eq("team_id", team_id)
            .execute()
        )
        return True

    @classmethod
    async def get_teams_for_goal(cls, supabase: Client, goal_id: int) -> List[int]:
        """
        Get all team IDs associated with a goal.

        Args:
            supabase: Supabase client instance
            goal_id: Goal ID

        Returns:
            List of team IDs
        """
        response = (
            supabase.table("goal_teams")
            .select("team_id")
            .eq("goal_id", goal_id)
            .execute()
        )
        return [row["team_id"] for row in response.data]

    @classmethod
    async def get_goals_for_team(cls, supabase: Client, team_id: int) -> List[int]:
        """
        Get all goal IDs associated with a team.

        Args:
            supabase: Supabase client instance
            team_id: Team ID

        Returns:
            List of goal IDs
        """
        response = (
            supabase.table("goal_teams")
            .select("goal_id")
            .eq("team_id", team_id)
            .execute()
        )
        return [row["goal_id"] for row in response.data]
