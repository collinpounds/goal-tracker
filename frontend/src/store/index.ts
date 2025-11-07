import { configureStore } from '@reduxjs/toolkit';
import goalReducer from '../models/goalSlice';
import authReducer from '../models/authSlice';
import teamReducer from '../models/teamSlice';
import notificationReducer from '../models/notificationSlice';
import categoryReducer from '../models/categorySlice';

export const store = configureStore({
  reducer: {
    goals: goalReducer,
    auth: authReducer,
    teams: teamReducer,
    notifications: notificationReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'goals/createGoal/fulfilled',
          'goals/updateGoal/fulfilled',
          'auth/checkSession/fulfilled',
          'auth/login/fulfilled',
          'auth/signup/fulfilled',
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
