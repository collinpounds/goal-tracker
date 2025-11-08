import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import { Category, CategoryCreate, CategoryUpdate } from '../types/category.types';
import { Goal } from '../types/goal.types';

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

/**
 * Get all categories for the current user
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/categories');
  return response.data;
};

/**
 * Get a single category by ID
 */
export const getCategory = async (categoryId: number): Promise<Category> {
  const response = await api.get<Category>(`/api/categories/${categoryId}`);
  return response.data;
};

/**
 * Get all goals for a specific category
 */
export const getCategoryGoals = async (categoryId: number): Promise<Goal[]> {
  const response = await api.get<Goal[]>(`/api/categories/${categoryId}/goals`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CategoryCreate): Promise<Category> => {
  const response = await api.post<Category>('/api/categories', categoryData);
  return response.data;
};

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId: number, categoryData: CategoryUpdate): Promise<Category> => {
  const response = await api.put<Category>(`/api/categories/${categoryId}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: number): Promise<void> => {
  await api.delete(`/api/categories/${categoryId}`);
};

/**
 * Add a category to a goal
 */
export const addCategoryToGoal = async (goalId: number, categoryId: number): Promise<Goal> => {
  const response = await api.post<Goal>(`/api/goals/${goalId}/categories/${categoryId}`, {});
  return response.data;
};

/**
 * Remove a category from a goal
 */
export const removeCategoryFromGoal = async (goalId: number, categoryId: number): Promise<void> => {
  await api.delete(`/api/goals/${goalId}/categories/${categoryId}`);
};

/**
 * Assign a goal to multiple categories (replaces all existing assignments)
 */
export const assignGoalToCategories = async (goalId: number, categoryIds: number[]): Promise<Goal> => {
  const response = await api.post<Goal>(`/api/goals/${goalId}/categories`, categoryIds);
  return response.data;
};
