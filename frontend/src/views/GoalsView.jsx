import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchGoals,
  fetchPublicGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  setEditingGoal,
  setShowForm,
  setActiveTab,
} from '../models/goalSlice';
import { logout, selectUser } from '../models/authSlice';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';
import VersionDisplay from '../components/VersionDisplay';

function GoalsView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { goals, publicGoals, loading, error, editingGoal, showForm, activeTab } = useSelector((state) => state.goals);
  const user = useSelector(selectUser);

  const displayGoals = activeTab === 'my-goals' ? goals : publicGoals;

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    if (tab === 'public' && publicGoals.length === 0) {
      dispatch(fetchPublicGoals());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Goal Tracker</h1>
            <p className="text-gray-600">Track and manage your goals effectively</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-1 inline-flex gap-1 mb-6">
          <button
            onClick={() => handleTabChange('my-goals')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'my-goals'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>My Goals</span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('public')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'public'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Public Goals</span>
            </div>
          </button>
        </div>

        {!showForm && activeTab === 'my-goals' && (
          <button
            onClick={handleShowForm}
            className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Goal
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
        ) : displayGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {activeTab === 'my-goals'
                ? 'No goals yet. Create your first goal to get started!'
                : 'No public goals available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={activeTab === 'my-goals' ? handleEdit : null}
                onDelete={activeTab === 'my-goals' ? handleDeleteGoal : null}
                onStatusChange={activeTab === 'my-goals' ? handleStatusChange : null}
              />
            ))}
          </div>
        )}
      </div>
      <VersionDisplay />
    </div>
  );
}

export default GoalsView;
