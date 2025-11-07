import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import { Goal, GoalCreate, GoalUpdate, GoalFilters } from '../types';

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

interface GetGoalsParams {
  search?: string;
  status?: string[];
  category_ids?: number[];
  target_date_from?: string;
  target_date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

export const goalService = {
  async getAllGoals(params: GetGoalsParams = {}): Promise<Goal[]> {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status.length > 0) {
      params.status.forEach(s => queryParams.append('status', s));
    }
    if (params.category_ids && params.category_ids.length > 0) {
      params.category_ids.forEach(id => queryParams.append('category_ids', String(id)));
    }
    if (params.target_date_from) queryParams.append('target_date_from', params.target_date_from);
    if (params.target_date_to) queryParams.append('target_date_to', params.target_date_to);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/goals?${queryString}` : '/api/goals';

    const response = await api.get<Goal[]>(url);
    return response.data;
  },

  async getPublicGoals(): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/api/goals/public');
    return response.data;
  },

  async getGoal(id: number): Promise<Goal> {
    const response = await api.get<Goal>(`/api/goals/${id}`);
    return response.data;
  },

  async createGoal(goal: GoalCreate): Promise<Goal> {
    const response = await api.post<Goal>('/api/goals', goal);
    return response.data;
  },

  async updateGoal(id: number, goal: GoalUpdate): Promise<Goal> {
    const response = await api.put<Goal>(`/api/goals/${id}`, goal);
    return response.data;
  },

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`/api/goals/${id}`);
  },
};
