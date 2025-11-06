import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTeams, toggleSidebar, setShowTeamForm } from '../models/teamSlice';
import { logout } from '../models/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { teams, sidebarCollapsed } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const toggleTeamExpanded = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const isActive = (path) => location.pathname === path;

  // Organize teams hierarchically
  const organizeTeams = (teams) => {
    const topLevel = teams.filter(t => !t.parent_team_id);
    const childMap = {};

    teams.forEach(team => {
      if (team.parent_team_id) {
        if (!childMap[team.parent_team_id]) {
          childMap[team.parent_team_id] = [];
        }
        childMap[team.parent_team_id].push(team);
      }
    });

    return { topLevel, childMap };
  };

  const { topLevel, childMap } = organizeTeams(teams);

  const renderTeam = (team, level = 0) => {
    const hasChildren = childMap[team.id] && childMap[team.id].length > 0;
    const isExpanded = expandedTeams.has(team.id);
    const isTeamActive = isActive(`/teams/${team.id}`);
    const paddingLeft = sidebarCollapsed ? 12 : 12 + (level * 16);

    return (
      <div key={team.id}>
        <button
          onClick={() => handleNavigate(`/teams/${team.id}`)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            isTeamActive
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          title={sidebarCollapsed ? team.name : ''}
        >
          {/* Team color indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: team.color_theme }}
          />

          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left truncate">{team.name}</span>

              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTeamExpanded(team.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </button>

        {/* Render child teams */}
        {!sidebarCollapsed && hasChildren && isExpanded && (
          <div className="mt-1">
            {childMap[team.id].map(childTeam => renderTeam(childTeam, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
        )}
        <button
          onClick={handleToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* All Goals */}
        <button
          onClick={() => handleNavigate('/goals')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/goals') || isActive('/')
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={sidebarCollapsed ? 'All Goals' : ''}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          {!sidebarCollapsed && <span>All Goals</span>}
        </button>

        {/* Private Goals */}
        <button
          onClick={() => handleNavigate('/goals/private')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/goals/private')
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={sidebarCollapsed ? 'Private' : ''}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {!sidebarCollapsed && <span>Private</span>}
        </button>

        {/* Public Goals */}
        <button
          onClick={() => handleNavigate('/goals/public')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive('/goals/public')
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={sidebarCollapsed ? 'Public' : ''}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {!sidebarCollapsed && <span>Public</span>}
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Teams Section Header */}
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Teams
            </h3>
            <button
              onClick={() => dispatch(setShowTeamForm(true))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Create new team"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {sidebarCollapsed && (
          <button
            onClick={() => dispatch(setShowTeamForm(true))}
            className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Create new team"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        )}

        {/* Teams List */}
        <div className="space-y-1 mt-2">
          {teams.length === 0 && !sidebarCollapsed && (
            <p className="text-xs text-gray-500 px-3 py-2">No teams yet</p>
          )}
          {topLevel.map(team => renderTeam(team))}
        </div>
      </div>

      {/* User Menu at Bottom */}
      <div className="border-t border-gray-200 p-3">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? user?.email : ''}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 truncate">View profile</p>
                </div>

                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />

              {/* Menu */}
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 ${
                  sidebarCollapsed ? 'left-full ml-2 w-56' : 'left-0 right-0'
                }`}
              >
                {/* User Info (only if collapsed) */}
                {sidebarCollapsed && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">User ID: {user?.id?.slice(0, 8)}...</p>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  {/* Profile Settings */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Profile Settings</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-1"></div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
