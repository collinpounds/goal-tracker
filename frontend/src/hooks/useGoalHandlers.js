import { useDispatch } from 'react-redux';
import { setEditingGoal, updateGoal, deleteGoal } from '../models/goalSlice';

/**
 * Custom hook that provides handlers for goal card operations
 * Uses optimistic updates - Redux automatically updates state without needing manual refreshes
 * @returns {Object} Object containing handleEdit, handleDelete, and handleStatusChange
 */
export const useGoalHandlers = () => {
  const dispatch = useDispatch();

  const handleEdit = (goal) => {
    dispatch(setEditingGoal(goal));
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    // Delete the goal - Redux will handle optimistic removal
    await dispatch(deleteGoal(goalId));

    // Redux automatically removes the goal from state:
    // - goalSlice.deleteGoal.fulfilled removes it from goals array
    // - teamSlice listens to deleteGoal.fulfilled and removes it from all team goals
  };

  const handleStatusChange = async (goalId, status) => {
    // Update the goal - Redux will handle optimistic update
    await dispatch(updateGoal({ id: goalId, goalData: { status } }));

    // Redux automatically updates the goal in state:
    // - goalSlice.updateGoal.fulfilled updates it in goals array
    // - teamSlice listens to updateGoal.fulfilled and updates it in all team goals
  };

  return {
    handleEdit,
    handleDelete,
    handleStatusChange,
  };
};
