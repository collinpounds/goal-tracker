import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchGoals,
  fetchPublicGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  setEditingGoal,
  setShowForm,
} from '../models/goalSlice';
import { fetchTeams, assignGoalToTeams } from '../models/teamSlice';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';

function GoalsView({ view = 'all' }) {
  const dispatch = useDispatch();
  const { goals, publicGoals, loading, error, editingGoal, showForm } = useSelector((state) => state.goals);
  const { teams } = useSelector((state) => state.teams);

  // Determine which goals to display based on view prop
  let displayGoals = [];
  let title = 'All Goals';

  if (view === 'private') {
    displayGoals = goals.filter(g => !g.is_public);
    title = 'Private Goals';
  } else if (view === 'public') {
    displayGoals = publicGoals;
    title = 'Public Goals';
  } else {
    // 'all' view - show user's goals (private + public)
    displayGoals = goals;
    title = 'All Goals';
  }

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTeams());

    // Fetch public goals if we're on public view
    if (view === 'public' && publicGoals.length === 0) {
      dispatch(fetchPublicGoals());
    }
  }, [dispatch, view]);

  const handleCreateGoal = async (goalData) => {
    const { team_ids, ...goalDataWithoutTeams } = goalData;

    // Create the goal first
    const result = await dispatch(createGoal(goalDataWithoutTeams));

    // If goal was created successfully and teams were selected, assign to teams
    if (result.payload && team_ids && team_ids.length > 0) {
      const goalId = result.payload.id;
      await dispatch(assignGoalToTeams({ goalId, teamIds: team_ids }));

      // Refresh goals to get updated team assignments
      dispatch(fetchGoals());
    }
  };

  const handleUpdateGoal = async (goalData) => {
    const { team_ids, ...goalDataWithoutTeams } = goalData;

    // Update the goal first
    const result = await dispatch(updateGoal({ id: editingGoal.id, goalData: goalDataWithoutTeams }));

    // If goal was updated successfully and teams were selected, assign to teams
    if (result.payload && team_ids && team_ids.length > 0) {
      await dispatch(assignGoalToTeams({ goalId: editingGoal.id, teamIds: team_ids }));

      // Refresh goals to get updated team assignments
      dispatch(fetchGoals());
    }
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

  // Helper to get teams for a goal
  const getGoalTeams = (goal) => {
    // Teams are now included in the goal object from the backend
    return goal.teams || [];
  };

  const isReadOnly = view === 'public';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">
          {view === 'private' && 'Your private goals, visible only to you'}
          {view === 'public' && 'Goals shared publicly by all users'}
          {view === 'all' && 'All your goals in one place'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GoalForm
              goal={editingGoal}
              onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
              onCancel={handleCancelEdit}
              teams={teams}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      ) : displayGoals.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-600 text-lg mb-4">
            {view === 'private' && 'No private goals yet'}
            {view === 'public' && 'No public goals available'}
            {view === 'all' && 'No goals yet'}
          </p>
          {!isReadOnly && (
            <button
              onClick={handleShowForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first goal
            </button>
          )}
        </div>
      ) : (
        /* Goals Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              teams={getGoalTeams(goal)}
              onEdit={!isReadOnly ? handleEdit : null}
              onDelete={!isReadOnly ? handleDeleteGoal : null}
              onStatusChange={!isReadOnly ? handleStatusChange : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsView;
