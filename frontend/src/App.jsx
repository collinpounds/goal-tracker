import React, { useState, useEffect } from 'react';
import { goalService } from './api/goals';
import GoalCard from './components/GoalCard';
import GoalForm from './components/GoalForm';

function App() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAllGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load goals. Please try again.');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await goalService.createGoal(goalData);
      setShowForm(false);
      loadGoals();
    } catch (err) {
      setError('Failed to create goal. Please try again.');
      console.error('Error creating goal:', err);
    }
  };

  const handleUpdateGoal = async (goalData) => {
    try {
      await goalService.updateGoal(editingGoal.id, goalData);
      setEditingGoal(null);
      setShowForm(false);
      loadGoals();
    } catch (err) {
      setError('Failed to update goal. Please try again.');
      console.error('Error updating goal:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await goalService.deleteGoal(id);
      loadGoals();
    } catch (err) {
      setError('Failed to delete goal. Please try again.');
      console.error('Error deleting goal:', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await goalService.updateGoal(id, { status });
      loadGoals();
    } catch (err) {
      setError('Failed to update status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Goal Tracker</h1>
          <p className="text-gray-600">Track and manage your goals effectively</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            + Create New Goal
          </button>
        )}

        {showForm && (
          <GoalForm
            goal={editingGoal}
            onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
            onCancel={handleCancelEdit}
          />
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No goals yet. Create your first goal to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDeleteGoal}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
