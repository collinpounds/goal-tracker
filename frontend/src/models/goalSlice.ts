import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { goalService } from '../api/goals';
import { Goal, GoalCreate, GoalUpdate, GoalStatus } from '../types';

interface GetGoalsParams {
  search?: string;
  status?: string[];
  category_ids?: number[];
  target_date_from?: string;
  target_date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

interface GoalFiltersState {
  search: string;
  status: GoalStatus[];
  category_ids: number[];
  target_date_from: string | null;
  target_date_to: string | null;
  sort_by: 'target_date' | 'created_at' | 'title';
  sort_order: 'asc' | 'desc';
}

interface GoalState {
  goals: Goal[];
  publicGoals: Goal[];
  loading: boolean;
  error: string | null;
  editingGoal: Goal | null;
  showForm: boolean;
  activeTab: string;
  filters: GoalFiltersState;
}

// Async thunks (Controllers)
export const fetchGoals = createAsyncThunk<Goal[], GetGoalsParams | undefined, { rejectValue: string }>(
  'goals/fetchGoals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await goalService.getAllGoals(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch goals');
    }
  }
);

export const fetchPublicGoals = createAsyncThunk<Goal[], void, { rejectValue: string }>(
  'goals/fetchPublicGoals',
  async (_, { rejectWithValue }) => {
    try {
      const data = await goalService.getPublicGoals();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch public goals');
    }
  }
);

export const createGoal = createAsyncThunk<Goal, GoalCreate, { rejectValue: string }>(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const data = await goalService.createGoal(goalData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create goal');
    }
  }
);

interface UpdateGoalParams {
  id: number;
  goalData: GoalUpdate;
}

export const updateGoal = createAsyncThunk<Goal, UpdateGoalParams, { rejectValue: string }>(
  'goals/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const data = await goalService.updateGoal(id, goalData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk<number, number, { rejectValue: string }>(
  'goals/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      await goalService.deleteGoal(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete goal');
    }
  }
);

const initialState: GoalState = {
  goals: [],
  publicGoals: [],
  loading: false,
  error: null,
  editingGoal: null,
  showForm: false,
  activeTab: 'my-goals',
  filters: {
    search: '',
    status: [],
    category_ids: [],
    target_date_from: null,
    target_date_to: null,
    sort_by: 'target_date',
    sort_order: 'asc',
  },
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setEditingGoal: (state, action: PayloadAction<Goal | null>) => {
      state.editingGoal = action.payload;
      state.showForm = action.payload !== null;
    },
    setShowForm: (state, action: PayloadAction<boolean>) => {
      state.showForm = action.payload;
      if (!action.payload) {
        state.editingGoal = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<GoalFiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<GoalStatus[]>) => {
      state.filters.status = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<number[]>) => {
      state.filters.category_ids = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'target_date' | 'created_at' | 'title'>) => {
      state.filters.sort_by = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sort_order = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: [],
        category_ids: [],
        target_date_from: null,
        target_date_to: null,
        sort_by: 'target_date',
        sort_order: 'asc',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Fetch public goals
      .addCase(fetchPublicGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.publicGoals = action.payload;
      })
      .addCase(fetchPublicGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
        state.showForm = false;
        state.editingGoal = null;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        state.showForm = false;
        state.editingGoal = null;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter((g) => g.id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });
  },
});

export const {
  setEditingGoal,
  setShowForm,
  clearError,
  setActiveTab,
  setFilters,
  setSearch,
  setStatusFilter,
  setCategoryFilter,
  setSortBy,
  setSortOrder,
  clearFilters,
} = goalSlice.actions;

export default goalSlice.reducer;
