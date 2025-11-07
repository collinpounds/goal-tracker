import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  togglePanel,
  markAsRead,
  markAllAsRead,
} from '../models/notificationSlice';
import { acceptInvitation, fetchPendingInvitations } from '../models/teamSlice';
import type { RootState, AppDispatch, Notification } from '../types';

type NotificationType = 'team_invitation' | 'team_member_added' | 'team_goal_assigned' | string;

const NotificationPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount, showPanel } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    // Fetch notifications on mount
    dispatch(fetchNotifications());

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleTogglePanel = () => {
    dispatch(togglePanel());
  };

  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    // Handle different notification types
    switch (notification.type) {
      case 'team_invitation':
        // related_id is the invitation ID
        if (notification.related_id) {
          try {
            // Accept the invitation
            await dispatch(acceptInvitation(notification.related_id)).unwrap();
            // Close the panel
            dispatch(togglePanel());
            // Show success message
            alert('Team invitation accepted! You are now a member of the team.');
            // Refresh notifications
            dispatch(fetchNotifications());
          } catch (error) {
            alert(`Failed to accept invitation: ${error}`);
          }
        }
        break;

      case 'team_member_added':
      case 'team_goal_assigned':
        // related_id is the team ID
        if (notification.related_id) {
          dispatch(togglePanel());
          navigate(`/teams/${notification.related_id}`);
        }
        break;

      default:
        // Just mark as read for other types
        break;
    }
  };

  const getNotificationIcon = (type: NotificationType): JSX.Element => {
    switch (type) {
      case 'team_invitation':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'team_member_added':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      case 'team_goal_assigned':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={handleTogglePanel}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleTogglePanel}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          {notification.type === 'team_invitation' && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              Click to accept invitation
                            </p>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
