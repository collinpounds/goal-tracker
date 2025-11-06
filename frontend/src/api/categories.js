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

/**
 * Get all categories for the current user
 */
export const getCategories = async () => {
  const response = await api.get('/api/categories');
  return response.data;
};

/**
 * Get a single category by ID
 */
export const getCategory = async (categoryId) => {
  const response = await api.get(`/api/categories/${categoryId}`);
  return response.data;
};

/**
 * Get all goals for a specific category
 */
export const getCategoryGoals = async (categoryId) => {
  const response = await api.get(`/api/categories/${categoryId}/goals`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/api/categories', categoryData);
  return response.data;
};

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId, categoryData) => {
  const response = await api.put(`/api/categories/${categoryId}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  await api.delete(`/api/categories/${categoryId}`);
};

/**
 * Add a category to a goal
 */
export const addCategoryToGoal = async (goalId, categoryId) => {
  const response = await api.post(`/api/goals/${goalId}/categories/${categoryId}`, {});
  return response.data;
};

/**
 * Remove a category from a goal
 */
export const removeCategoryFromGoal = async (goalId, categoryId) => {
  await api.delete(`/api/goals/${goalId}/categories/${categoryId}`);
};

/**
 * Assign a goal to multiple categories (replaces all existing assignments)
 */
export const assignGoalToCategories = async (goalId, categoryIds) => {
  const response = await api.post(`/api/goals/${goalId}/categories`, categoryIds);
  return response.data;
};
