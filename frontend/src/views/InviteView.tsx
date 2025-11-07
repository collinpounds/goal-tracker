import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { joinViaInviteCode } from '../models/teamSlice';
import { invitationService } from '../api/teams';
import type { RootState, AppDispatch, Team } from '../types';

interface InviteInfo {
  team: Team;
  invited_by?: {
    full_name?: string;
    email: string;
  };
}

const InviteView = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchInviteInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await invitationService.getInvitationByCode(inviteCode!);
        setInviteInfo(data as InviteInfo);
      } catch (err: any) {
        console.error('Error fetching invite info:', err);
        setError(err.response?.data?.detail || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) {
      fetchInviteInfo();
    }
  }, [inviteCode]);

  const handleJoinTeam = async () => {
    try {
      setJoining(true);
      setError(null);
      await dispatch(joinViaInviteCode(inviteCode!)).unwrap();
      // Navigate to the team page
      if (inviteInfo?.team?.id) {
        navigate(`/teams/${inviteInfo.team.id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error joining team:', err);
      setError((err as string) || 'Failed to join team');
      setJoining(false);
    }
  };

  const handleDecline = () => {
    navigate('/');
  };

  if (!user) {
    // If user is not logged in, redirect to login with invite code
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
            <p className="text-gray-600">Please log in or sign up to accept this invitation</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/login?redirect=/invite/${inviteCode}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => navigate(`/signup?redirect=/invite/${inviteCode}`)}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
          {inviteInfo?.team && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">You've been invited to join</p>
              <p className="text-xl font-semibold text-gray-900">{inviteInfo.team.name}</p>
              {inviteInfo.team.description && (
                <p className="text-sm text-gray-600 mt-2">{inviteInfo.team.description}</p>
              )}
            </div>
          )}
          {inviteInfo?.invited_by && (
            <p className="text-sm text-gray-600">
              Invited by {inviteInfo.invited_by.full_name || inviteInfo.invited_by.email}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleJoinTeam}
            disabled={joining}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join Team'}
          </button>
          <button
            onClick={handleDecline}
            disabled={joining}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteView;
