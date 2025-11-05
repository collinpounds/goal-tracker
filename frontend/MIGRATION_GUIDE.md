# Migration Guide: Local State to Redux + React Router

## Summary of Changes

This guide documents the migration from local React state management to a Redux Toolkit + React Router architecture following MVC patterns.

## What Changed

### Before (Local State)
- State managed with `useState` in App.jsx
- Direct API calls in event handlers
- Single-page application (no routing)
- All logic in one App.jsx file (~147 lines)

### After (Redux + React Router)
- Centralized state in Redux store
- Async operations in Redux thunks
- Multi-page routing with React Router
- Separated concerns: Models, Views, Components
- Scalable architecture for future features

## New Dependencies

Run this command to install the new packages:
```bash
npm install
```

New packages added to package.json:
- `@reduxjs/toolkit@^2.0.1` - Redux with less boilerplate
- `react-redux@^9.0.4` - React bindings for Redux
- `react-router-dom@^6.21.2` - Client-side routing

## File Changes

### Created Files

1. **[src/models/goalSlice.js](src/models/goalSlice.js)** (147 lines)
   - Redux slice with state, reducers, and async thunks
   - Handles all goal-related state management
   - Exports actions: `fetchGoals`, `createGoal`, `updateGoal`, `deleteGoal`

2. **[src/store/index.js](src/store/index.js)** (17 lines)
   - Redux store configuration
   - Combines all reducers (currently just goals)

3. **[src/routes/index.jsx](src/routes/index.jsx)** (27 lines)
   - React Router configuration
   - Route definitions for all pages

4. **[src/views/GoalsView.jsx](src/views/GoalsView.jsx)** (106 lines)
   - Main goals page component
   - Connects to Redux store
   - Dispatches actions on user interactions

5. **[src/views/NotFoundView.jsx](src/views/NotFoundView.jsx)** (19 lines)
   - 404 error page

6. **[frontend/MVC_ARCHITECTURE.md](MVC_ARCHITECTURE.md)** (500+ lines)
   - Comprehensive architecture documentation
   - Best practices and patterns
   - Examples for adding new features

7. **[frontend/MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** (This file)
   - Migration instructions and summary

### Modified Files

1. **[src/App.jsx](src/App.jsx)**
   - Reduced from 147 lines to 15 lines
   - Now only sets up Redux Provider and Router
   - All logic moved to GoalsView and Redux

2. **[package.json](package.json)**
   - Added Redux and React Router dependencies

3. **[CLAUDE.md](../CLAUDE.md)**
   - Updated frontend structure section
   - Added MVC architecture references

### Unchanged Files

- [src/components/GoalCard.jsx](src/components/GoalCard.jsx) - No changes
- [src/components/GoalForm.jsx](src/components/GoalForm.jsx) - No changes
- [src/api/goals.js](src/api/goals.js) - No changes
- [src/main.jsx](src/main.jsx) - No changes
- [src/index.css](src/index.css) - No changes

## Code Comparison

### Old App.jsx (Before)
```javascript
function App() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAllGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // ... more handlers and JSX
}
```

### New App.jsx (After)
```javascript
function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}
```

### Redux Slice (New)
```javascript
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      return await goalService.getAllGoals();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState: { goals: [], loading: false, error: null },
  reducers: { /* ... */ },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      // ...
  }
});
```

### View Component (New)
```javascript
function GoalsView() {
  const dispatch = useDispatch();
  const { goals, loading, error } = useSelector(state => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleCreateGoal = (goalData) => {
    dispatch(createGoal(goalData));
  };

  // ... render JSX
}
```

## Benefits of New Architecture

### 1. Separation of Concerns
- **Models** (Redux slices) - State and business logic
- **Views** (Page components) - UI and user interactions
- **Components** (Reusable UI) - Presentational components

### 2. Centralized State Management
- Single source of truth for application state
- Predictable state updates
- Easy to debug with Redux DevTools

### 3. Scalability
- Easy to add new features (just add new slices and views)
- Can share state between multiple components/pages
- Better code organization for larger teams

### 4. Routing Support
- Multiple pages (home, 404, etc.)
- URL-based navigation
- Easy to add protected routes, nested routes, etc.

### 5. Better Testing
- Redux slices can be tested independently
- Views can be tested with mock store
- Easier to write unit and integration tests

### 6. Developer Experience
- Redux DevTools for time-travel debugging
- Hot module replacement works better
- Easier to onboard new developers

## How to Use

### Running the Application

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Or use Docker:**
   ```bash
   docker-compose up --build
   ```

### Accessing the Application
- Frontend: http://localhost (or http://localhost:5173 in dev mode)
- Backend API: http://localhost:8000

### Adding a New Feature

Example: Adding a "favorite" feature to goals

1. **Update Redux slice:**
```javascript
// src/models/goalSlice.js
reducers: {
  toggleFavorite: (state, action) => {
    const goal = state.goals.find(g => g.id === action.payload);
    if (goal) goal.isFavorite = !goal.isFavorite;
  }
}
```

2. **Use in view:**
```javascript
// src/views/GoalsView.jsx
import { toggleFavorite } from '../models/goalSlice';

const handleToggleFavorite = (id) => {
  dispatch(toggleFavorite(id));
};
```

3. **Update component:**
```javascript
// src/components/GoalCard.jsx
<button onClick={() => onToggleFavorite(goal.id)}>
  {goal.isFavorite ? '★' : '☆'}
</button>
```

## Troubleshooting

### Issue: "Cannot find module '@reduxjs/toolkit'"
**Solution:** Run `npm install` in the frontend directory

### Issue: Router not working
**Solution:** Make sure you're using the new App.jsx with `<Provider>` and `<AppRouter>`

### Issue: State not updating
**Solution:** Check Redux DevTools to see if actions are being dispatched correctly

### Issue: Docker build failing
**Solution:** Rebuild the Docker image: `docker-compose down -v && docker-compose up --build`

## Next Steps

### Recommended Enhancements

1. **Add TypeScript** - Better type safety and developer experience
2. **Add Authentication** - User login/logout with protected routes
3. **Add Persistence** - Save Redux state to localStorage
4. **Add More Pages** - Dashboard, Settings, Profile, etc.
5. **Add Testing** - Unit tests for slices, integration tests for views
6. **Add Error Boundaries** - Better error handling in React
7. **Add Loading Skeletons** - Better UX during data loading

### Optional Features

- **Redux Persist** - Persist state across page refreshes
- **RTK Query** - More advanced data fetching and caching
- **React Hook Form** - Better form management
- **Zod/Yup** - Form validation schemas
- **React Query** - Alternative to Redux for server state

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [MVC Architecture Guide](MVC_ARCHITECTURE.md)
- [Redux Style Guide](https://redux.js.org/style-guide/)

## Questions?

Refer to:
1. [MVC_ARCHITECTURE.md](MVC_ARCHITECTURE.md) - Detailed architecture documentation
2. [CLAUDE.md](../CLAUDE.md) - Project instructions
3. [Redux Toolkit Tutorial](https://redux-toolkit.js.org/tutorials/quick-start)
4. [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
