import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../api/teams';

// =====================================================
// ASYNC THUNKS
// =====================================================

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (unreadOnly = false, { rejectWithValue }) => {
    try {
      const data = await notificationService.getAllNotifications(unreadOnly);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await notificationService.markAsRead(notificationId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to mark all as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch unread count');
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
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
    setShowPanel: (state, action) => {
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
    addNotification: (state, action) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload;
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
