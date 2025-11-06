import axios from 'axios';
import { supabase } from '../lib/supabase';

// Use relative URLs in production (when deployed), absolute URL in development
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Add Authorization header if session exists
      if (session?.access_token) {
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
  async getAllTeams() {
    const response = await api.get('/api/teams');
    return response.data;
  },

  // Get a specific team by ID
  async getTeam(teamId) {
    const response = await api.get(`/api/teams/${teamId}`);
    return response.data;
  },

  // Create a new team
  async createTeam(teamData) {
    const response = await api.post('/api/teams', teamData);
    return response.data;
  },

  // Update a team
  async updateTeam(teamId, teamData) {
    const response = await api.put(`/api/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete a team
  async deleteTeam(teamId) {
    await api.delete(`/api/teams/${teamId}`);
  },

  // Get team members
  async getTeamMembers(teamId) {
    const response = await api.get(`/api/teams/${teamId}/members`);
    return response.data;
  },

  // Add a member to a team
  async addTeamMember(teamId, userId) {
    const response = await api.post(`/api/teams/${teamId}/members`, { member_user_id: userId });
    return response.data;
  },

  // Update team member role
  async updateMemberRole(teamId, userId, role) {
    const response = await api.put(`/api/teams/${teamId}/members/${userId}`, { role });
    return response.data;
  },

  // Remove a member from a team
  async removeMember(teamId, userId) {
    await api.delete(`/api/teams/${teamId}/members/${userId}`);
  },

  // Get team goals
  async getTeamGoals(teamId) {
    const response = await api.get(`/api/teams/${teamId}/goals`);
    return response.data;
  },

  // Assign goal to teams
  async assignGoalToTeams(goalId, teamIds) {
    const response = await api.post(`/api/goals/${goalId}/teams`, { team_ids: teamIds });
    return response.data;
  },

  // Unassign goal from team
  async unassignGoalFromTeam(goalId, teamId) {
    await api.delete(`/api/goals/${goalId}/teams/${teamId}`);
  },
};

// =====================================================
// INVITATION SERVICES
// =====================================================

export const invitationService = {
  // Send team invitation by email
  async sendInvitation(teamId, email) {
    const response = await api.post(`/api/teams/${teamId}/invite`, {
      team_id: teamId,
      email: email,
    });
    return response.data;
  },

  // Get pending invitations for current user
  async getPendingInvitations() {
    const response = await api.get('/api/invitations');
    return response.data;
  },

  // Accept an invitation
  async acceptInvitation(invitationId) {
    const response = await api.post(`/api/invitations/${invitationId}/accept`);
    return response.data;
  },

  // Decline an invitation
  async declineInvitation(invitationId) {
    await api.post(`/api/invitations/${invitationId}/decline`);
  },

  // Get invitation by code (for shareable links)
  async getInvitationByCode(inviteCode) {
    const response = await api.get(`/api/invite/${inviteCode}`);
    return response.data;
  },

  // Join team via invite code
  async joinViaInviteCode(inviteCode) {
    const response = await api.post(`/api/invite/${inviteCode}/join`);
    return response.data;
  },
};

// =====================================================
// NOTIFICATION SERVICES
// =====================================================

export const notificationService = {
  // Get all notifications for current user
  async getAllNotifications(unreadOnly = false) {
    const response = await api.get('/api/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    await api.put('/api/notifications/read-all');
  },

  // Get unread count
  async getUnreadCount() {
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
