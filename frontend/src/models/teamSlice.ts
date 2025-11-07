import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { teamService, invitationService } from '../api/teams';
import { updateGoal, deleteGoal } from './goalSlice';
import { Team, TeamMember, Invitation, TeamCreate, TeamUpdate, TeamRole } from '../types';
import { Goal } from '../types';

// =====================================================
// ASYNC THUNKS - TEAMS
// =====================================================

export const fetchTeams = createAsyncThunk<Team[], void, { rejectValue: string }>(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamService.getAllTeams();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch teams');
    }
  }
);

export const fetchTeam = createAsyncThunk<Team, number, { rejectValue: string }>(
  'teams/fetchTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeam(teamId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team');
    }
  }
);

export const createTeam = createAsyncThunk<Team, TeamCreate, { rejectValue: string }>(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const data = await teamService.createTeam(teamData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to create team');
    }
  }
);

interface UpdateTeamParams {
  teamId: number;
  teamData: TeamUpdate;
}

export const updateTeam = createAsyncThunk<Team, UpdateTeamParams, { rejectValue: string }>(
  'teams/updateTeam',
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      const data = await teamService.updateTeam(teamId, teamData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk<number, number, { rejectValue: string }>(
  'teams/deleteTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId);
      return teamId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to delete team');
    }
  }
);

// =====================================================
// ASYNC THUNKS - TEAM MEMBERS
// =====================================================

interface FetchTeamMembersResult {
  teamId: number;
  members: TeamMember[];
}

export const fetchTeamMembers = createAsyncThunk<FetchTeamMembersResult, number, { rejectValue: string }>(
  'teams/fetchTeamMembers',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeamMembers(teamId);
      return { teamId, members: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team members');
    }
  }
);

interface AddTeamMemberParams {
  teamId: number;
  userId: string;
}

interface AddTeamMemberResult {
  teamId: number;
  member: TeamMember;
}

export const addTeamMember = createAsyncThunk<AddTeamMemberResult, AddTeamMemberParams, { rejectValue: string }>(
  'teams/addTeamMember',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      const data = await teamService.addTeamMember(teamId, userId);
      return { teamId, member: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to add team member');
    }
  }
);

interface UpdateMemberRoleParams {
  teamId: number;
  userId: string;
  role: TeamRole;
}

interface UpdateMemberRoleResult {
  teamId: number;
  member: TeamMember;
}

export const updateMemberRole = createAsyncThunk<UpdateMemberRoleResult, UpdateMemberRoleParams, { rejectValue: string }>(
  'teams/updateMemberRole',
  async ({ teamId, userId, role }, { rejectWithValue }) => {
    try {
      const data = await teamService.updateMemberRole(teamId, userId, role);
      return { teamId, member: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update member role');
    }
  }
);

interface RemoveMemberParams {
  teamId: number;
  userId: string;
}

interface RemoveMemberResult {
  teamId: number;
  userId: string;
}

export const removeMember = createAsyncThunk<RemoveMemberResult, RemoveMemberParams, { rejectValue: string }>(
  'teams/removeMember',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await teamService.removeMember(teamId, userId);
      return { teamId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to remove member');
    }
  }
);

// =====================================================
// ASYNC THUNKS - TEAM GOALS
// =====================================================

interface FetchTeamGoalsResult {
  teamId: number;
  goals: Goal[];
}

export const fetchTeamGoals = createAsyncThunk<FetchTeamGoalsResult, number, { rejectValue: string }>(
  'teams/fetchTeamGoals',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeamGoals(teamId);
      return { teamId, goals: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team goals');
    }
  }
);

interface AssignGoalToTeamsParams {
  goalId: number;
  teamIds: number[];
}

interface AssignGoalToTeamsResult {
  goalId: number;
  teamIds: number[];
}

export const assignGoalToTeams = createAsyncThunk<AssignGoalToTeamsResult, AssignGoalToTeamsParams, { rejectValue: string }>(
  'teams/assignGoalToTeams',
  async ({ goalId, teamIds }, { rejectWithValue }) => {
    try {
      await teamService.assignGoalToTeams(goalId, teamIds);
      return { goalId, teamIds };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to assign goal to teams');
    }
  }
);

interface UnassignGoalFromTeamParams {
  goalId: number;
  teamId: number;
}

interface UnassignGoalFromTeamResult {
  goalId: number;
  teamId: number;
}

export const unassignGoalFromTeam = createAsyncThunk<UnassignGoalFromTeamResult, UnassignGoalFromTeamParams, { rejectValue: string }>(
  'teams/unassignGoalFromTeam',
  async ({ goalId, teamId }, { rejectWithValue }) => {
    try {
      await teamService.unassignGoalFromTeam(goalId, teamId);
      return { goalId, teamId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to unassign goal');
    }
  }
);

// =====================================================
// ASYNC THUNKS - INVITATIONS
// =====================================================

interface SendInvitationParams {
  teamId: number;
  email: string;
}

interface SendInvitationResult {
  teamId: number;
  invitation: Invitation;
}

export const sendInvitation = createAsyncThunk<SendInvitationResult, SendInvitationParams, { rejectValue: string }>(
  'teams/sendInvitation',
  async ({ teamId, email }, { rejectWithValue, dispatch }) => {
    try {
      const data = await invitationService.sendInvitation(teamId, email);
      // Refresh team invitations after sending
      dispatch(fetchTeamInvitations(teamId));
      return { teamId, invitation: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to send invitation');
    }
  }
);

interface FetchTeamInvitationsResult {
  teamId: number;
  invitations: Invitation[];
}

export const fetchTeamInvitations = createAsyncThunk<FetchTeamInvitationsResult, number, { rejectValue: string }>(
  'teams/fetchTeamInvitations',
  async (teamId, { rejectWithValue }) => {
    try {
      const data = await invitationService.getTeamInvitations(teamId);
      return { teamId, invitations: data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch team invitations');
    }
  }
);

export const fetchPendingInvitations = createAsyncThunk<Invitation[], void, { rejectValue: string }>(
  'teams/fetchPendingInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getPendingInvitations();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch invitations');
    }
  }
);

export const acceptInvitation = createAsyncThunk<number, number, { rejectValue: string }>(
  'teams/acceptInvitation',
  async (invitationId, { rejectWithValue, dispatch }) => {
    try {
      await invitationService.acceptInvitation(invitationId);
      // Refresh teams after accepting invitation
      dispatch(fetchTeams());
      return invitationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to accept invitation');
    }
  }
);

export const declineInvitation = createAsyncThunk<number, number, { rejectValue: string }>(
  'teams/declineInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      await invitationService.declineInvitation(invitationId);
      return invitationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to decline invitation');
    }
  }
);

export const joinViaInviteCode = createAsyncThunk<string, string, { rejectValue: string }>(
  'teams/joinViaInviteCode',
  async (inviteCode, { rejectWithValue, dispatch }) => {
    try {
      await invitationService.joinViaInviteCode(inviteCode);
      // Refresh teams after joining
      dispatch(fetchTeams());
      return inviteCode;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to join team');
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

interface TeamState {
  teams: Team[];
  teamMembers: Record<number, TeamMember[]>;
  teamGoals: Record<number, Goal[]>;
  teamInvitations: Record<number, Invitation[]>;
  pendingInvitations: Invitation[];
  selectedTeamId: number | null;
  loading: boolean;
  error: string | null;
  showTeamForm: boolean;
  editingTeam: Team | null;
  showInviteModal: boolean;
  invitingTeamId: number | null;
  sidebarCollapsed: boolean;
}

const initialState: TeamState = {
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

interface SetShowInviteModalPayload {
  show: boolean;
  teamId?: number | null;
}

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeamId: (state, action: PayloadAction<number | null>) => {
      state.selectedTeamId = action.payload;
    },
    setShowTeamForm: (state, action: PayloadAction<boolean>) => {
      state.showTeamForm = action.payload;
      if (!action.payload) {
        state.editingTeam = null;
      }
    },
    setEditingTeam: (state, action: PayloadAction<Team | null>) => {
      state.editingTeam = action.payload;
      state.showTeamForm = action.payload !== null;
    },
    setShowInviteModal: (state, action: PayloadAction<SetShowInviteModalPayload>) => {
      state.showInviteModal = action.payload.show;
      state.invitingTeamId = action.payload.teamId || null;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
        state.error = action.payload || 'An error occurred';
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
      })

      // =====================================================
      // LISTEN TO GOAL UPDATES (from goalSlice)
      // =====================================================
      .addCase(updateGoal.fulfilled, (state, action) => {
        // Update the goal in all team goals lists that contain it
        const updatedGoal = action.payload;
        Object.keys(state.teamGoals).forEach((teamIdStr) => {
          const teamId = Number(teamIdStr);
          const goalIndex = state.teamGoals[teamId].findIndex((g) => g.id === updatedGoal.id);
          if (goalIndex !== -1) {
            state.teamGoals[teamId][goalIndex] = updatedGoal;
          }
        });
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        // Remove the goal from all team goals lists
        const deletedGoalId = action.payload;
        Object.keys(state.teamGoals).forEach((teamIdStr) => {
          const teamId = Number(teamIdStr);
          state.teamGoals[teamId] = state.teamGoals[teamId].filter((g) => g.id !== deletedGoalId);
        });
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
