import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import TeamFormModal from './TeamFormModal';
import GoalForm from './GoalForm';
import { setShowForm, setEditingGoal, createGoal, updateGoal } from '../models/goalSlice';
import { fetchTeams, assignGoalToTeams } from '../models/teamSlice';
import { useEffect } from 'react';

const Layout = () => {
  const dispatch = useDispatch();
  const { showForm, editingGoal } = useSelector((state) => state.goals);
  const { teams } = useSelector((state) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleNewGoal = () => {
    dispatch(setShowForm(true));
  };

  const handleCreateGoal = async (goalData) => {
    const { team_ids, ...goalDataWithoutTeams } = goalData;

    const result = await dispatch(createGoal(goalDataWithoutTeams));

    if (result.payload && team_ids && team_ids.length > 0) {
      const goalId = result.payload.id;
      await dispatch(assignGoalToTeams({ goalId, teamIds: team_ids }));
    }
  };

  const handleUpdateGoal = async (goalData) => {
    const { team_ids, ...goalDataWithoutTeams } = goalData;

    const result = await dispatch(updateGoal({ id: editingGoal.id, goalData: goalDataWithoutTeams }));

    if (result.payload && team_ids && team_ids.length > 0) {
      await dispatch(assignGoalToTeams({ goalId: editingGoal.id, teamIds: team_ids }));
    }
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

      {/* Goal Form Modal - Global */}
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
    </div>
  );
};

export default Layout;
