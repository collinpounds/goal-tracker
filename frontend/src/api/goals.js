import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
