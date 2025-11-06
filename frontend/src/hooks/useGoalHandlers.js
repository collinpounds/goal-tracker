import { useDispatch } from 'react-redux';
import { setEditingGoal, updateGoal, deleteGoal } from '../models/goalSlice';

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

    // Call refresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleStatusChange = async (goalId, status) => {
    await dispatch(updateGoal({ id: goalId, goalData: { status } }));

    // Call refresh callback if provided
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
