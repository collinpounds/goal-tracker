import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  setEditingGoal,
  setShowForm,
} from '../models/goalSlice';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';

function GoalsView() {
  const dispatch = useDispatch();
  const { goals, loading, error, editingGoal, showForm } = useSelector((state) => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleCreateGoal = (goalData) => {
    dispatch(createGoal(goalData));
  };

  const handleUpdateGoal = (goalData) => {
    dispatch(updateGoal({ id: editingGoal.id, goalData }));
  };

  const handleDeleteGoal = (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    dispatch(deleteGoal(id));
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateGoal({ id, goalData: { status } }));
  };

  const handleEdit = (goal) => {
    dispatch(setEditingGoal(goal));
  };

  const handleCancelEdit = () => {
    dispatch(setShowForm(false));
  };

  const handleShowForm = () => {
    dispatch(setShowForm(true));
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
            onClick={handleShowForm}
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

export default GoalsView;
