import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryAPI from '../api/categories';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryAPI.getCategories();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryGoals = createAsyncThunk(
  'categories/fetchCategoryGoals',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await categoryAPI.getCategoryGoals(categoryId);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch category goals');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoryAPI.createCategory(categoryData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await categoryAPI.updateCategory(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await categoryAPI.deleteCategory(categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete category');
    }
  }
);

export const addCategoryToGoal = createAsyncThunk(
  'categories/addCategoryToGoal',
  async ({ goalId, categoryId }, { rejectWithValue }) => {
    try {
      await categoryAPI.addCategoryToGoal(goalId, categoryId);
      return { goalId, categoryId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add category to goal');
    }
  }
);

export const removeCategoryFromGoal = createAsyncThunk(
  'categories/removeCategoryFromGoal',
  async ({ goalId, categoryId }, { rejectWithValue }) => {
    try {
      await categoryAPI.removeCategoryFromGoal(goalId, categoryId);
      return { goalId, categoryId };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove category from goal');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    selectedCategory: null,
    categoryGoals: [],
    loading: false,
    error: null,
    showCategoryForm: false,
    editingCategory: null,
  },
  reducers: {
    setShowCategoryForm: (state, action) => {
      state.showCategoryForm = action.payload;
    },
    setEditingCategory: (state, action) => {
      state.editingCategory = action.payload;
      state.showCategoryForm = action.payload !== null;
    },
    setSelectedCategory: (state, action) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
