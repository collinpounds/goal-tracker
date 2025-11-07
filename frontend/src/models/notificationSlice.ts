import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '../api/teams';
import { Notification } from '../types';

// =====================================================
// ASYNC THUNKS
// =====================================================

export const fetchNotifications = createAsyncThunk<Notification[], boolean, { rejectValue: string }>(
  'notifications/fetchNotifications',
  async (unreadOnly = false, { rejectWithValue }) => {
    try {
      const data = await notificationService.getAllNotifications(unreadOnly);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk<Notification, number, { rejectValue: string }>(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAsRead(notificationId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to mark all as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch unread count');
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  showPanel: boolean;
}

const initialState: NotificationState = {
  notifications: [], // All notifications
  unreadCount: 0, // Number of unread notifications
  loading: false,
  error: null,
  showPanel: false, // Show/hide notification panel
};

// =====================================================
// SLICE
// =====================================================

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setShowPanel: (state, action: PayloadAction<boolean>) => {
      state.showPanel = action.payload;
    },
    togglePanel: (state) => {
      state.showPanel = !state.showPanel;
    },
    clearError: (state) => {
      state.error = null;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // For real-time notifications (if implemented with websockets/polling)
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        // Update unread count
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        const index = state.notifications.findIndex((n) => n.id === updatedNotification.id);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications[index] = updatedNotification;
          if (wasUnread && updatedNotification.read && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || 'An error occurred';
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload || 'An error occurred';
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

// =====================================================
// EXPORTS
// =====================================================

export const {
  setShowPanel,
  togglePanel,
  clearError,
  incrementUnreadCount,
  decrementUnreadCount,
  addNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
