import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as categoryAPI from '../api/categories';
import { Category, CategoryCreate, CategoryUpdate } from '../types';
import { Goal } from '../types';
import { updateGoal, deleteGoal } from './goalSlice';

// Async thunks
export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryAPI.getCategories();
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryGoals = createAsyncThunk<Goal[], number, { rejectValue: string }>(
  'categories/fetchCategoryGoals',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await categoryAPI.getCategoryGoals(categoryId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch category goals');
    }
  }
);

export const createCategory = createAsyncThunk<Category, CategoryCreate, { rejectValue: string }>(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoryAPI.createCategory(categoryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create category');
    }
  }
);

interface UpdateCategoryParams {
  id: number;
  data: CategoryUpdate;
}

export const updateCategory = createAsyncThunk<Category, UpdateCategoryParams, { rejectValue: string }>(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await categoryAPI.updateCategory(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk<number, number, { rejectValue: string }>(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await categoryAPI.deleteCategory(categoryId);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete category');
    }
  }
);

interface AddCategoryToGoalParams {
  goalId: number;
  categoryId: number;
}

interface AddCategoryToGoalResult {
  goalId: number;
  categoryId: number;
}

export const addCategoryToGoal = createAsyncThunk<AddCategoryToGoalResult, AddCategoryToGoalParams, { rejectValue: string }>(
  'categories/addCategoryToGoal',
  async ({ goalId, categoryId }, { rejectWithValue }) => {
    try {
      await categoryAPI.addCategoryToGoal(goalId, categoryId);
      return { goalId, categoryId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add category to goal');
    }
  }
);

interface RemoveCategoryFromGoalParams {
  goalId: number;
  categoryId: number;
}

interface RemoveCategoryFromGoalResult {
  goalId: number;
  categoryId: number;
}

export const removeCategoryFromGoal = createAsyncThunk<RemoveCategoryFromGoalResult, RemoveCategoryFromGoalParams, { rejectValue: string }>(
  'categories/removeCategoryFromGoal',
  async ({ goalId, categoryId }, { rejectWithValue }) => {
    try {
      await categoryAPI.removeCategoryFromGoal(goalId, categoryId);
      return { goalId, categoryId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to remove category from goal');
    }
  }
);

interface AssignGoalToCategoriesParams {
  goalId: number;
  categoryIds: number[];
}

interface AssignGoalToCategoriesResult {
  goalId: number;
  categoryIds: number[];
}

export const assignGoalToCategories = createAsyncThunk<AssignGoalToCategoriesResult, AssignGoalToCategoriesParams, { rejectValue: string }>(
  'categories/assignGoalToCategories',
  async ({ goalId, categoryIds }, { rejectWithValue }) => {
    try {
      await categoryAPI.assignGoalToCategories(goalId, categoryIds);
      return { goalId, categoryIds };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to assign goal to categories');
    }
  }
);

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  categoryGoals: Goal[];
  loading: boolean;
  error: string | null;
  showCategoryForm: boolean;
  editingCategory: Category | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  categoryGoals: [],
  loading: false,
  error: null,
  showCategoryForm: false,
  editingCategory: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setShowCategoryForm: (state, action: PayloadAction<boolean>) => {
      state.showCategoryForm = action.payload;
    },
    setEditingCategory: (state, action: PayloadAction<Category | null>) => {
      state.editingCategory = action.payload;
      state.showCategoryForm = action.payload !== null;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Fetch category goals
      .addCase(fetchCategoryGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryGoals = action.payload;
      })
      .addCase(fetchCategoryGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.showCategoryForm = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.showCategoryForm = false;
        state.editingCategory = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })

      // =====================================================
      // LISTEN TO GOAL UPDATES (from goalSlice)
      // =====================================================
      .addCase(updateGoal.fulfilled, (state, action) => {
        // Update the goal in the categoryGoals array if it exists
        const updatedGoal = action.payload;
        const goalIndex = state.categoryGoals.findIndex((g) => g.id === updatedGoal.id);
        if (goalIndex !== -1) {
          state.categoryGoals[goalIndex] = updatedGoal;
        }
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        // Remove the goal from categoryGoals array
        const deletedGoalId = action.payload;
        state.categoryGoals = state.categoryGoals.filter((g) => g.id !== deletedGoalId);
      });
  },
});

export const {
  setShowCategoryForm,
  setEditingCategory,
  setSelectedCategory,
  clearError,
} = categorySlice.actions;

export default categorySlice.reducer;
