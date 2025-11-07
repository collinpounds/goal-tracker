import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import { Team, TeamCreate, TeamUpdate, TeamMember, Invitation, TeamRole } from '../types/team.types';
import { Goal } from '../types/goal.types';
import { Notification } from '../types/notification.types';

// Use relative URLs in production (when deployed), absolute URL in development
const API_URL = import.meta.env.VITE_API_URL || '';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Add Authorization header if session exists
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      return config;
    } catch (error) {
      console.error('Error getting session for API request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.warn('Unauthorized request, redirecting to login...');

      // Clear the Supabase session
      await supabase.auth.signOut();

      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// =====================================================
// TEAM SERVICES
// =====================================================

export const teamService = {
  // Get all teams for current user
  async getAllTeams(): Promise<Team[]> {
    const response = await api.get<Team[]>('/api/teams');
    return response.data;
  },

  // Get a specific team by ID
  async getTeam(teamId: number): Promise<Team> {
    const response = await api.get<Team>(`/api/teams/${teamId}`);
    return response.data;
  },

  // Create a new team
  async createTeam(teamData: TeamCreate): Promise<Team> {
    const response = await api.post<Team>('/api/teams', teamData);
    return response.data;
  },

  // Update a team
  async updateTeam(teamId: number, teamData: TeamUpdate): Promise<Team> {
    const response = await api.put<Team>(`/api/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete a team
  async deleteTeam(teamId: number): Promise<void> {
    await api.delete(`/api/teams/${teamId}`);
  },

  // Get team members
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await api.get<TeamMember[]>(`/api/teams/${teamId}/members`);
    return response.data;
  },

  // Add a member to a team
  async addTeamMember(teamId: number, userId: string): Promise<TeamMember> {
    const response = await api.post<TeamMember>(`/api/teams/${teamId}/members`, { member_user_id: userId });
    return response.data;
  },

  // Update team member role
  async updateMemberRole(teamId: number, userId: string, role: TeamRole): Promise<TeamMember> {
    const response = await api.put<TeamMember>(`/api/teams/${teamId}/members/${userId}`, { role });
    return response.data;
  },

  // Remove a member from a team
  async removeMember(teamId: number, userId: string): Promise<void> {
    await api.delete(`/api/teams/${teamId}/members/${userId}`);
  },

  // Get team goals
  async getTeamGoals(teamId: number): Promise<Goal[]> {
    const response = await api.get<Goal[]>(`/api/teams/${teamId}/goals`);
    return response.data;
  },

  // Assign goal to teams
  async assignGoalToTeams(goalId: number, teamIds: number[]): Promise<Goal> {
    const response = await api.post<Goal>(`/api/goals/${goalId}/teams`, { team_ids: teamIds });
    return response.data;
  },

  // Unassign goal from team
  async unassignGoalFromTeam(goalId: number, teamId: number): Promise<void> {
    await api.delete(`/api/goals/${goalId}/teams/${teamId}`);
  },
};

// =====================================================
// INVITATION SERVICES
// =====================================================

export const invitationService = {
  // Send team invitation by email
  async sendInvitation(teamId: number, email: string): Promise<Invitation> {
    const response = await api.post<Invitation>(`/api/teams/${teamId}/invite`, {
      team_id: teamId,
      email: email,
    });
    return response.data;
  },

  // Get all invitations for a team
  async getTeamInvitations(teamId: number): Promise<Invitation[]> {
    const response = await api.get<Invitation[]>(`/api/teams/${teamId}/invitations`);
    return response.data;
  },

  // Get pending invitations for current user
  async getPendingInvitations(): Promise<Invitation[]> {
    const response = await api.get<Invitation[]>('/api/invitations');
    return response.data;
  },

  // Accept an invitation
  async acceptInvitation(invitationId: number): Promise<Invitation> {
    const response = await api.post<Invitation>(`/api/invitations/${invitationId}/accept`);
    return response.data;
  },

  // Decline an invitation
  async declineInvitation(invitationId: number): Promise<void> {
    await api.post(`/api/invitations/${invitationId}/decline`);
  },

  // Get invitation by code (for shareable links)
  async getInvitationByCode(inviteCode: string): Promise<Team> {
    const response = await api.get<Team>(`/api/invite/${inviteCode}`);
    return response.data;
  },

  // Join team via invite code
  async joinViaInviteCode(inviteCode: string): Promise<Team> {
    const response = await api.post<Team>(`/api/invite/${inviteCode}/join`);
    return response.data;
  },
};

// =====================================================
// NOTIFICATION SERVICES
// =====================================================

export const notificationService = {
  // Get all notifications for current user
  async getAllNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/api/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await api.put<Notification>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/api/notifications/read-all');
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getAllNotifications(true);
    return notifications.length;
  },
};

// Export individual services for convenience
export default {
  teamService,
  invitationService,
  notificationService,
};
