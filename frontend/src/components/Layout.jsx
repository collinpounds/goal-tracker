import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import TeamFormModal from './TeamFormModal';
import CategoryFormModal from './CategoryFormModal';
import GoalForm from './GoalForm';
import { setShowForm, setEditingGoal, createGoal, updateGoal, fetchGoals } from '../models/goalSlice';
import { fetchTeams, assignGoalToTeams, fetchTeamGoals } from '../models/teamSlice';
import { fetchCategories, assignGoalToCategories, fetchCategoryGoals } from '../models/categorySlice';
import { useEffect } from 'react';

const Layout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { showForm, editingGoal } = useSelector((state) => state.goals);
  const { teams } = useSelector((state) => state.teams);
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleNewGoal = () => {
    dispatch(setShowForm(true));
  };

  const handleCreateGoal = async (goalData) => {
    const { team_ids, category_ids, ...goalDataWithoutRelations } = goalData;

    const result = await dispatch(createGoal(goalDataWithoutRelations));

    if (result.payload) {
      const goalId = result.payload.id;

      // Assign to teams if selected
      if (team_ids && team_ids.length > 0) {
        await dispatch(assignGoalToTeams({ goalId, teamIds: team_ids }));

        // Only refresh team goals if we assigned to teams
        const teamIdMatch = location.pathname.match(/\/teams\/(\d+)/);
        if (teamIdMatch) {
          dispatch(fetchTeamGoals(parseInt(teamIdMatch[1])));
        }
      }

      // Assign to categories if selected
      if (category_ids && category_ids.length > 0) {
        await dispatch(assignGoalToCategories({ goalId, categoryIds: category_ids }));

        // Refresh category goals if we're on a category page
        const categoryIdMatch = location.pathname.match(/\/categories\/(\d+)/);
        if (categoryIdMatch) {
          dispatch(fetchCategoryGoals(parseInt(categoryIdMatch[1])));
        }
      }
    }

    // Redux already added the goal to state via createGoal.fulfilled
    // No need to fetchGoals() - it would cause unnecessary re-renders
  };

  const handleUpdateGoal = async (goalData) => {
    const { team_ids, category_ids, ...goalDataWithoutRelations } = goalData;

    const result = await dispatch(updateGoal({ id: editingGoal.id, goalData: goalDataWithoutRelations }));

    if (result.payload) {
      // Always assign teams (even if empty array to clear old assignments)
      if (team_ids !== undefined) {
        await dispatch(assignGoalToTeams({ goalId: editingGoal.id, teamIds: team_ids }));

        // Refresh team goals if we're on a team page
        const teamIdMatch = location.pathname.match(/\/teams\/(\d+)/);
        if (teamIdMatch) {
          dispatch(fetchTeamGoals(parseInt(teamIdMatch[1])));
        }
      }

      // Always assign categories (even if empty array to clear old assignments)
      if (category_ids !== undefined) {
        await dispatch(assignGoalToCategories({ goalId: editingGoal.id, categoryIds: category_ids }));

        // Refresh category goals if we're on a category page
        const categoryIdMatch = location.pathname.match(/\/categories\/(\d+)/);
        if (categoryIdMatch) {
          dispatch(fetchCategoryGoals(parseInt(categoryIdMatch[1])));
        }
      }
    }

    // Need to refresh goals to get updated teams/categories from backend
    // The updateGoal response has teams/categories, but they're updated AFTER via assignment endpoints
    setTimeout(() => {
      dispatch(fetchGoals({}));
    }, 200);
  };

  const handleCancelEdit = () => {
    dispatch(setShowForm(false));
    dispatch(setEditingGoal(null));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Goal Tracker</h1>

          <div className="flex items-center gap-4">
            {/* New Goal Button */}
            <button
              onClick={handleNewGoal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Goal</span>
            </button>

            {/* Notification Bell */}
            <NotificationPanel />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <TeamFormModal />
      <CategoryFormModal />

      {/* Goal Form Modal - Global */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GoalForm
              goal={editingGoal}
              onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
              onCancel={handleCancelEdit}
              teams={teams}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
