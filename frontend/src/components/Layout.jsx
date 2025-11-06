import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import TeamFormModal from './TeamFormModal';
import { setShowForm } from '../models/goalSlice';

const Layout = () => {
  const dispatch = useDispatch();

  const handleNewGoal = () => {
    dispatch(setShowForm(true));
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
    </div>
  );
};

export default Layout;
