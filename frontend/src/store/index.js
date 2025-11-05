import { configureStore } from '@reduxjs/toolkit';
import goalReducer from '../models/goalSlice';
import authReducer from '../models/authSlice';

export const store = configureStore({
  reducer: {
    goals: goalReducer,
    auth: authReducer,
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

export default store;
