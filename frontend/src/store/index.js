import { configureStore } from '@reduxjs/toolkit';
import goalReducer from '../models/goalSlice';

export const store = configureStore({
  reducer: {
    goals: goalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['goals/createGoal/fulfilled', 'goals/updateGoal/fulfilled'],
      },
    }),
});

export default store;
