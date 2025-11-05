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

export const goalService = {
  async getAllGoals() {
    const response = await api.get('/api/goals');
    return response.data;
  },

  async getGoal(id) {
    const response = await api.get(`/api/goals/${id}`);
    return response.data;
  },

  async createGoal(goal) {
    const response = await api.post('/api/goals', goal);
    return response.data;
  },

  async updateGoal(id, goal) {
    const response = await api.put(`/api/goals/${id}`, goal);
    return response.data;
  },

  async deleteGoal(id) {
    await api.delete(`/api/goals/${id}`);
  },
};
