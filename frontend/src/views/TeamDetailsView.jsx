import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamGoals,
  fetchTeamInvitations,
  sendInvitation,
  setEditingTeam,
  setShowInviteModal,
  deleteTeam,
  removeMember,
} from '../models/teamSlice';
import GoalCard from '../components/GoalCard';
import { useGoalHandlers } from '../hooks/useGoalHandlers';

const TeamDetailsView = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { teams, teamMembers, teamGoals, teamInvitations, loading } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('goals');

  const team = teams.find((t) => t.id === parseInt(teamId));
  const members = teamMembers[teamId] || [];
  const goals = teamGoals[teamId] || [];
  const invitations = teamInvitations[teamId] || [];

  // Use shared goal handlers - no refresh needed, Redux handles optimistic updates
  const { handleEdit, handleDelete, handleStatusChange } = useGoalHandlers();

  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeam(parseInt(teamId)));
      dispatch(fetchTeamMembers(parseInt(teamId)));
      dispatch(fetchTeamGoals(parseInt(teamId)));
      dispatch(fetchTeamInvitations(parseInt(teamId)));
    }
  }, [dispatch, teamId]);

  const handleEditTeam = () => {
    dispatch(setEditingTeam(team));
  };

  const handleInviteMembers = async () => {
    const email = prompt('Enter the email address to invite:');
    if (email) {
      try {
        await dispatch(sendInvitation({ teamId: parseInt(teamId), email })).unwrap();
        alert(`Invitation sent to ${email}`);
      } catch (error) {
        alert(`Failed to send invitation: ${error}`);
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      await dispatch(deleteTeam(parseInt(teamId)));
      navigate('/goals');
    }
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    const confirmMessage = `Are you sure you want to remove ${memberName || 'this member'} from the team?`;
    if (window.confirm(confirmMessage)) {
      try {
        await dispatch(removeMember({ teamId: parseInt(teamId), userId: memberUserId })).unwrap();
        // Refresh team members
        dispatch(fetchTeamMembers(parseInt(teamId)));
      } catch (error) {
        alert(`Failed to remove member: ${error}`);
      }
    }
  };

  const isOwner = members.some((m) => m.user_id === user?.id && m.role === 'owner');

  if (loading && !team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Not Found</h2>
        <p className="text-gray-600 mb-4">The team you're looking for doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/goals')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Goals
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Team Color */}
            <div
              className="w-16 h-16 rounded-lg flex-shrink-0"
              style={{ backgroundColor: team.color_theme }}
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
              {team.description && (
                <p className="text-gray-600 mb-3">{team.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                <span>•</span>
                <span>{goals.length} {goals.length === 1 ? 'goal' : 'goals'}</span>
                {team.parent_team_id && (
                  <>
                    <span>•</span>
                    <span>Sub-team (Level {team.nesting_level + 1})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleInviteMembers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Invite
              </button>

              <button
                onClick={handleEditTeam}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Members ({members.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'goals' && (
            <div>
              {goals.length === 0 ? (
                <div className="text-center py-12">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No team goals yet</h3>
                  <p className="text-gray-600">Assign goals to this team to see them here.</p>
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
          )}

          {activeTab === 'members' && (
            <div className="space-y-8">
              {/* Active Members Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Members</h3>
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No members found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                            {member.email ? member.email[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.first_name || member.last_name
                                ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                                : member.email || `User ${member.user_id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              member.role === 'owner'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {member.role === 'owner' ? 'Owner' : 'Member'}
                          </span>

                          {isOwner && member.role !== 'owner' && (
                            <button
                              onClick={() => {
                                const memberName = member.first_name || member.last_name
                                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                                  : member.email || `User ${member.user_id.slice(0, 8)}`;
                                handleRemoveMember(member.user_id, memberName);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove member"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Invitations Section */}
              {invitations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
                  <div className="space-y-3">
                    {invitations.filter((inv) => inv.status === 'pending').map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invitation.email}</p>
                            <p className="text-sm text-gray-600">
                              Invited {new Date(invitation.created_at).toLocaleDateString()} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                          {isOwner && (
                            <button
                              onClick={() => {
                                const inviteLink = `${window.location.origin}/invite/${invitation.invite_code}`;
                                navigator.clipboard.writeText(inviteLink);
                                alert('Invite link copied to clipboard!');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Copy invite link"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Team Section */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
          <p className="text-gray-600 mb-4">Once you delete a team, there is no going back. Please be certain.</p>
          <button
            onClick={handleDeleteTeam}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete This Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamDetailsView;
