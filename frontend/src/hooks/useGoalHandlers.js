import { useDispatch } from 'react-redux';
import { setEditingGoal, updateGoal, deleteGoal, fetchGoals } from '../models/goalSlice';

/**
 * Custom hook that provides handlers for goal card operations
 * @param {Function} onRefresh - Optional callback to refresh goals after operations
 * @returns {Object} Object containing handleEdit, handleDelete, and handleStatusChange
 */
export const useGoalHandlers = (onRefresh) => {
  const dispatch = useDispatch();

  const handleEdit = (goal) => {
    dispatch(setEditingGoal(goal));
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    await dispatch(deleteGoal(goalId));

    // Always refresh main goals list
    dispatch(fetchGoals());

    // Call refresh callback if provided (for team-specific refresh)
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleStatusChange = async (goalId, status) => {
    // Update the goal - Redux will handle optimistic update
    await dispatch(updateGoal({ id: goalId, goalData: { status } }));

    // Only call the refresh callback if provided (for team-specific refresh)
    // We don't need to fetchGoals() because Redux already updated the state optimistically
    if (onRefresh) {
      onRefresh();
    }
  };

  return {
    handleEdit,
    handleDelete,
    handleStatusChange,
  };
};
