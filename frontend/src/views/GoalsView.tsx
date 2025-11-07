import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGoals,
  fetchPublicGoals,
  createGoal,
  updateGoal,
  setShowForm,
} from '../models/goalSlice';
import { fetchTeams, assignGoalToTeams } from '../models/teamSlice';
import { fetchCategories, assignGoalToCategories } from '../models/categorySlice';
import GoalCard from '../components/GoalCard';
import GoalForm from '../components/GoalForm';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import { useGoalHandlers } from '../hooks/useGoalHandlers';
import type { RootState, AppDispatch, Goal, GoalCreate, GoalUpdate, Team, Category } from '../types';

interface GoalsViewProps {
  view?: 'all' | 'private' | 'public';
}

function GoalsView({ view = 'all' }: GoalsViewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, publicGoals, loading, error, editingGoal, showForm, filters } = useSelector((state: RootState) => state.goals);
  const { teams } = useSelector((state: RootState) => state.teams);

  // Use shared goal handlers hook
  const { handleEdit, handleDelete, handleStatusChange } = useGoalHandlers();

  // Determine which goals to display based on view prop
  let displayGoals: Goal[] = [];
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

  // Fetch goals when filters change
  useEffect(() => {
    dispatch(fetchGoals(filters));
  }, [dispatch, filters]);

  // Fetch teams and categories only on mount
  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchCategories());

    // Fetch public goals if we're on public view
    if (view === 'public' && publicGoals.length === 0) {
      dispatch(fetchPublicGoals());
    }
  }, [dispatch, view, publicGoals.length]);

  const handleCreateGoal = async (goalData: GoalCreate) => {
    const { team_ids, category_ids, ...goalDataWithoutRelations } = goalData;

    // Create the goal first
    const result = await dispatch(createGoal(goalDataWithoutRelations));

    if (result.payload) {
      const goalId = (result.payload as Goal).id;

      // If goal was created successfully and teams were selected, assign to teams
      if (team_ids && team_ids.length > 0) {
        await dispatch(assignGoalToTeams({ goalId, teamIds: team_ids }));
      }

      // If goal was created successfully and categories were selected, assign to categories
      if (category_ids && category_ids.length > 0) {
        await dispatch(assignGoalToCategories({ goalId, categoryIds: category_ids }));
      }
    }

    // Always refresh goals after creation to get updated data
    setTimeout(() => dispatch(fetchGoals(filters)), 100);
  };

  const handleUpdateGoal = async (goalData: GoalUpdate) => {
    if (!editingGoal) return;

    const { team_ids, category_ids, ...goalDataWithoutRelations } = goalData;

    // Update the goal first
    const result = await dispatch(updateGoal({ id: editingGoal.id, goalData: goalDataWithoutRelations }));

    if (result.payload) {
      // Always assign teams (even if empty array to clear old assignments)
      if (team_ids !== undefined) {
        await dispatch(assignGoalToTeams({ goalId: editingGoal.id, teamIds: team_ids }));
      }

      // Always assign categories (even if empty array to clear old assignments)
      if (category_ids !== undefined) {
        await dispatch(assignGoalToCategories({ goalId: editingGoal.id, categoryIds: category_ids }));
      }
    }

    // Always refresh goals after update to get updated data with teams/categories
    setTimeout(() => {
      dispatch(fetchGoals(filters));
    }, 200);
  };

  const handleCancelEdit = () => {
    dispatch(setShowForm(false));
  };

  const handleShowForm = () => {
    dispatch(setShowForm(true));
  };

  // Helper to get teams for a goal
  const getGoalTeams = (goal: Goal): Team[] => {
    // Teams are now included in the goal object from the backend
    return goal.teams || [];
  };

  // Helper to get categories for a goal
  const getGoalCategories = (goal: Goal): Category[] => {
    // Categories are now included in the goal object from the backend
    return goal.categories || [];
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

      {/* Search and Filter Bar (only for 'all' view) */}
      {view === 'all' && !isReadOnly && (
        <SearchAndFilterBar />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
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
              categories={getGoalCategories(goal)}
              onEdit={!isReadOnly ? handleEdit : undefined}
              onDelete={!isReadOnly ? handleDelete : undefined}
              onStatusChange={!isReadOnly ? handleStatusChange : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsView;
