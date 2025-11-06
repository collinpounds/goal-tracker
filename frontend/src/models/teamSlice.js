import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamService, invitationService } from '../api/teams';

// =====================================================
// ASYNC THUNKS - TEAMS
// =====================================================

export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamService.getAllTeams();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeam = createAsyncThunk(
  'teams/fetchTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeam(teamId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const data = await teamService.createTeam(teamData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      const data = await teamService.updateTeam(teamId, teamData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId);
      return teamId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to delete team');
    }
  }
);

// =====================================================
// ASYNC THUNKS - TEAM MEMBERS
// =====================================================

export const fetchTeamMembers = createAsyncThunk(
  'teams/fetchTeamMembers',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeamMembers(teamId);
      return { teamId, members: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team members');
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      const data = await teamService.addTeamMember(teamId, userId);
      return { teamId, member: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to add team member');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'teams/updateMemberRole',
  async ({ teamId, userId, role }, { rejectWithValue }) => {
    try {
      const data = await teamService.updateMemberRole(teamId, userId, role);
      return { teamId, member: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update member role');
    }
  }
);

export const removeMember = createAsyncThunk(
  'teams/removeMember',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await teamService.removeMember(teamId, userId);
      return { teamId, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to remove member');
    }
  }
);

// =====================================================
// ASYNC THUNKS - TEAM GOALS
// =====================================================

export const fetchTeamGoals = createAsyncThunk(
  'teams/fetchTeamGoals',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeamGoals(teamId);
      return { teamId, goals: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team goals');
    }
  }
);

export const assignGoalToTeams = createAsyncThunk(
  'teams/assignGoalToTeams',
  async ({ goalId, teamIds }, { rejectWithValue }) => {
    try {
      await teamService.assignGoalToTeams(goalId, teamIds);
      return { goalId, teamIds };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to assign goal to teams');
    }
  }
);

export const unassignGoalFromTeam = createAsyncThunk(
  'teams/unassignGoalFromTeam',
  async ({ goalId, teamId }, { rejectWithValue }) => {
    try {
      await teamService.unassignGoalFromTeam(goalId, teamId);
      return { goalId, teamId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to unassign goal');
    }
  }
);

// =====================================================
// ASYNC THUNKS - INVITATIONS
// =====================================================

export const sendInvitation = createAsyncThunk(
  'teams/sendInvitation',
  async ({ teamId, email }, { rejectWithValue, dispatch }) => {
    try {
      const data = await invitationService.sendInvitation(teamId, email);
      // Refresh team invitations after sending
      dispatch(fetchTeamInvitations(teamId));
      return { teamId, invitation: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to send invitation');
    }
  }
);

export const fetchTeamInvitations = createAsyncThunk(
  'teams/fetchTeamInvitations',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await invitationService.getTeamInvitations(teamId);
      return { teamId, invitations: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team invitations');
    }
  }
);

export const fetchPendingInvitations = createAsyncThunk(
  'teams/fetchPendingInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getPendingInvitations();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch invitations');
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'teams/acceptInvitation',
  async (invitationId, { rejectWithValue, dispatch }) => {
    try {
      await invitationService.acceptInvitation(invitationId);
      // Refresh teams after accepting invitation
      dispatch(fetchTeams());
      return invitationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to accept invitation');
    }
  }
);

export const declineInvitation = createAsyncThunk(
  'teams/declineInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      await invitationService.declineInvitation(invitationId);
      return invitationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to decline invitation');
    }
  }
);

export const joinViaInviteCode = createAsyncThunk(
  'teams/joinViaInviteCode',
  async (inviteCode, { rejectWithValue, dispatch }) => {
    try {
      await invitationService.joinViaInviteCode(inviteCode);
      // Refresh teams after joining
      dispatch(fetchTeams());
      return inviteCode;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to join team');
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  teams: [], // All teams user is a member of
  teamMembers: {}, // Team members by team ID { teamId: [members] }
  teamGoals: {}, // Team goals by team ID { teamId: [goals] }
  teamInvitations: {}, // Team invitations by team ID { teamId: [invitations] }
  pendingInvitations: [], // Pending invitations for current user
  selectedTeamId: null, // Currently selected team
  loading: false,
  error: null,
  showTeamForm: false, // Show/hide team creation form
  editingTeam: null, // Team being edited
  showInviteModal: false, // Show/hide invite modal
  invitingTeamId: null, // Team for which to show invite modal
  sidebarCollapsed: false, // Sidebar collapse state
};

// =====================================================
// SLICE
// =====================================================

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeamId: (state, action) => {
      state.selectedTeamId = action.payload;
    },
    setShowTeamForm: (state, action) => {
      state.showTeamForm = action.payload;
      if (!action.payload) {
        state.editingTeam = null;
      }
    },
    setEditingTeam: (state, action) => {
      state.editingTeam = action.payload;
      state.showTeamForm = action.payload !== null;
    },
    setShowInviteModal: (state, action) => {
      state.showInviteModal = action.payload.show;
      state.invitingTeamId = action.payload.teamId || null;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // =====================================================
      // TEAMS
      // =====================================================
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single team
      .addCase(fetchTeam.fulfilled, (state, action) => {
        const team = action.payload;
        const index = state.teams.findIndex((t) => t.id === team.id);
        if (index !== -1) {
          state.teams[index] = team;
        } else {
          state.teams.push(team);
        }
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
        state.showTeamForm = false;
        state.editingTeam = null;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update team
      .addCase(updateTeam.fulfilled, (state, action) => {
        const updatedTeam = action.payload;
        const index = state.teams.findIndex((t) => t.id === updatedTeam.id);
        if (index !== -1) {
          state.teams[index] = updatedTeam;
        }
        state.showTeamForm = false;
        state.editingTeam = null;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete team
      .addCase(deleteTeam.fulfilled, (state, action) => {
        const teamId = action.payload;
        state.teams = state.teams.filter((t) => t.id !== teamId);
        // Clear related data
        delete state.teamMembers[teamId];
        delete state.teamGoals[teamId];
        if (state.selectedTeamId === teamId) {
          state.selectedTeamId = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.error = action.payload;
      })

      // =====================================================
      // TEAM MEMBERS
      // =====================================================
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        const { teamId, members } = action.payload;
        state.teamMembers[teamId] = members;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        const { teamId, member } = action.payload;
        if (!state.teamMembers[teamId]) {
          state.teamMembers[teamId] = [];
        }
        state.teamMembers[teamId].push(member);
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const { teamId, member } = action.payload;
        if (state.teamMembers[teamId]) {
          const index = state.teamMembers[teamId].findIndex((m) => m.id === member.id);
          if (index !== -1) {
            state.teamMembers[teamId][index] = member;
          }
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        const { teamId, userId } = action.payload;
        if (state.teamMembers[teamId]) {
          state.teamMembers[teamId] = state.teamMembers[teamId].filter((m) => m.user_id !== userId);
        }
      })

      // =====================================================
      // TEAM GOALS
      // =====================================================
      .addCase(fetchTeamGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamGoals.fulfilled, (state, action) => {
        state.loading = false;
        const { teamId, goals } = action.payload;
        state.teamGoals[teamId] = goals;
      })
      .addCase(fetchTeamGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // INVITATIONS
      // =====================================================
      .addCase(sendInvitation.fulfilled, (state, action) => {
        // Invitation sent successfully
        state.showInviteModal = false;
        state.invitingTeamId = null;
      })
      .addCase(sendInvitation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchTeamInvitations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamInvitations.fulfilled, (state, action) => {
        state.loading = false;
        const { teamId, invitations } = action.payload;
        state.teamInvitations[teamId] = invitations;
      })
      .addCase(fetchTeamInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingInvitations.fulfilled, (state, action) => {
        state.pendingInvitations = action.payload;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        const invitationId = action.payload;
        state.pendingInvitations = state.pendingInvitations.filter((inv) => inv.id !== invitationId);
      })
      .addCase(declineInvitation.fulfilled, (state, action) => {
        const invitationId = action.payload;
        state.pendingInvitations = state.pendingInvitations.filter((inv) => inv.id !== invitationId);
      });
  },
});

// =====================================================
// EXPORTS
// =====================================================

export const {
  setSelectedTeamId,
  setShowTeamForm,
  setEditingTeam,
  setShowInviteModal,
  setSidebarCollapsed,
  toggleSidebar,
  clearError,
} = teamSlice.actions;

export default teamSlice.reducer;
