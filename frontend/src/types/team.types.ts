export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  creator_id: string;
  invite_code: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Invitation {
  id: number;
  team_id: number;
  email: string;
  status: InvitationStatus;
  created_at: string;
  team?: Team;
}

export interface TeamCreate {
  name: string;
  description?: string | null;
}

export interface TeamUpdate {
  name?: string;
  description?: string | null;
}
