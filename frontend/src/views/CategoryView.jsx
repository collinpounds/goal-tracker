import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  fetchCategoryGoals,
  setEditingCategory,
  deleteCategory,
  setShowCategoryForm,
} from '../models/categorySlice';
import { setShowForm } from '../models/goalSlice';
import GoalCard from '../components/GoalCard';
import { useGoalHandlers } from '../hooks/useGoalHandlers';

const CategoryView = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, categoryGoals, loading } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);

  const category = categories.find((c) => c.id === parseInt(categoryId));
  const goals = categoryGoals[categoryId] || [];

  // Use shared goal handlers - no refresh needed, Redux handles optimistic updates
  const { handleEdit, handleDelete, handleStatusChange } = useGoalHandlers();

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategories());
      dispatch(fetchCategoryGoals(parseInt(categoryId)));
    }
  }, [dispatch, categoryId]);

  const handleEditCategory = () => {
    dispatch(setEditingCategory(category));
  };

  const handleDeleteCategory = async () => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      await dispatch(deleteCategory(parseInt(categoryId)));
      navigate('/goals');
    }
  };

  const handleCreateGoal = () => {
    // Open goal form with this category pre-selected
    dispatch(setShowForm(true));
  };

  if (!category && !loading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h2>
        <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/goals')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Goals
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Category Color */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: category?.color }}
            >
              {category?.icon || ''}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
              <p className="text-gray-600 mt-1">
                {goals.length} {goals.length === 1 ? 'goal' : 'goals'} in this category
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateGoal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Goal
            </button>

            <button
              onClick={handleEditCategory}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>

            <button
              onClick={handleDeleteCategory}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Goals</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals in this category yet</h3>
              <p className="text-gray-600 mb-4">Assign goals to this category to see them here.</p>
              <button
                onClick={handleCreateGoal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  teams={goal.teams || []}
                  categories={goal.categories || []}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
