# Frontend MVC Architecture with Redux and React Router

## Overview

This frontend application follows an MVC (Model-View-Controller) architecture pattern using Redux Toolkit and React Router.

## Directory Structure

```
frontend/src/
├── api/                    # API service layer
│   └── goals.js           # Goal API calls (axios)
├── components/            # Reusable UI components
│   ├── GoalCard.jsx      # Goal display component
│   └── GoalForm.jsx      # Goal form component
├── models/               # Redux slices (Model layer)
│   └── goalSlice.js     # Goal state, reducers, and async thunks
├── store/                # Redux store configuration
│   └── index.js         # Store setup
├── routes/               # Router configuration
│   └── index.jsx        # Route definitions
├── views/                # Page-level components (View layer)
│   ├── GoalsView.jsx    # Main goals page
│   └── NotFoundView.jsx # 404 page
├── App.jsx               # Root component with Provider
├── main.jsx              # Application entry point
└── index.css             # Global styles (Tailwind)
```

## Architecture Layers

### Model Layer (models/)

**Purpose:** State management, business logic, and data fetching

- **Redux Slices:** Define state shape, reducers, and actions
- **Async Thunks:** Handle asynchronous operations (API calls)
- **Selectors:** (Can be added) Derive data from state

**Example:**
```javascript
// models/goalSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async () => {
  return await goalService.getAllGoals();
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: { goals: [], loading: false },
  reducers: { /* sync actions */ },
  extraReducers: { /* async thunk handlers */ }
});
```

### View Layer (views/)

**Purpose:** Page-level components that compose UI and connect to Redux

- Connect to Redux store using `useSelector` and `useDispatch`
- Handle user interactions and dispatch actions
- Compose smaller components from `components/`
- Correspond to routes

**Example:**
```javascript
// views/GoalsView.jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoals } from '../models/goalSlice';

function GoalsView() {
  const dispatch = useDispatch();
  const { goals, loading } = useSelector(state => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  return <div>{/* Render goals */}</div>;
}
```

### Controller Layer (Integrated in Redux Thunks)

**Purpose:** Handle business logic and coordinate between Model and View

In this architecture, the controller logic is embedded in:
- **Redux Thunks** (async operations in `models/goalSlice.js`)
- **Action Creators** (sync operations in slice reducers)
- **View Event Handlers** (UI-specific logic in view components)

**Example:**
```javascript
// Controller logic in Redux thunk
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const data = await goalService.createGoal(goalData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Data Flow

1. **User Action** → View component (e.g., button click)
2. **Dispatch Action** → Redux action dispatched
3. **Thunk Execution** → Async operation (API call)
4. **State Update** → Reducer updates state
5. **Re-render** → Components re-render with new state

```
User Interaction
      ↓
   View (GoalsView)
      ↓
   dispatch(action)
      ↓
   Redux Thunk (fetchGoals)
      ↓
   API Service (goalService)
      ↓
   Reducer (goalSlice)
      ↓
   State Update
      ↓
   View Re-render
```

## Redux Store Structure

```javascript
{
  goals: {
    goals: [],          // Array of goal objects
    loading: false,     // Loading state
    error: null,        // Error message
    editingGoal: null,  // Currently editing goal
    showForm: false     // Form visibility
  }
  // Add more slices as the app grows
  // users: { ... },
  // settings: { ... }
}
```

## React Router Configuration

Routes are defined in [routes/index.jsx](routes/index.jsx):

```javascript
const router = createBrowserRouter([
  { path: '/', element: <GoalsView /> },
  { path: '/goals', element: <GoalsView /> },
  { path: '*', element: <NotFoundView /> }
]);
```

## Key Technologies

- **Redux Toolkit** - State management with less boilerplate
- **React Redux** - React bindings for Redux
- **React Router v6** - Client-side routing
- **Redux Thunks** - Async action creators (built into Redux Toolkit)

## Adding New Features

### 1. Add a New Resource (e.g., Projects)

**Step 1: Create API Service**
```javascript
// api/projects.js
export const projectService = {
  getAll: () => axios.get('/api/projects'),
  create: (data) => axios.post('/api/projects', data),
  // ...
};
```

**Step 2: Create Redux Slice**
```javascript
// models/projectSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProjects = createAsyncThunk(...);
const projectSlice = createSlice(...);
```

**Step 3: Add to Store**
```javascript
// store/index.js
import projectReducer from '../models/projectSlice';

export const store = configureStore({
  reducer: {
    goals: goalReducer,
    projects: projectReducer, // Add new reducer
  },
});
```

**Step 4: Create View**
```javascript
// views/ProjectsView.jsx
function ProjectsView() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects.projects);
  // ...
}
```

**Step 5: Add Route**
```javascript
// routes/index.jsx
{ path: '/projects', element: <ProjectsView /> }
```

### 2. Add a New Action to Existing Slice

```javascript
// models/goalSlice.js
const goalSlice = createSlice({
  name: 'goals',
  reducers: {
    // Add new synchronous action
    toggleFavorite: (state, action) => {
      const goal = state.goals.find(g => g.id === action.payload);
      if (goal) goal.isFavorite = !goal.isFavorite;
    }
  }
});
```

### 3. Add Middleware (Optional)

```javascript
// store/index.js
import logger from 'redux-logger';

export const store = configureStore({
  reducer: { goals: goalReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});
```

## Best Practices

### 1. Keep Views Simple
- Views should primarily compose components and connect to Redux
- Move complex logic to thunks or utility functions

### 2. Use Selectors for Derived Data
```javascript
// models/goalSlice.js
export const selectCompletedGoals = (state) =>
  state.goals.goals.filter(g => g.status === 'completed');

// In view
const completedGoals = useSelector(selectCompletedGoals);
```

### 3. Normalize State Shape
For complex data, normalize the state:
```javascript
{
  goals: {
    byId: { '1': {...}, '2': {...} },
    allIds: ['1', '2'],
    loading: false
  }
}
```

### 4. Handle Loading States
Always handle loading, success, and error states:
```javascript
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{!loading && !error && <Content />}
```

### 5. Use TypeScript (Future Enhancement)
Consider migrating to TypeScript for better type safety:
```typescript
interface Goal {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}
```

## Testing Strategy

### Unit Tests
- **Redux Slices:** Test reducers and actions
- **Components:** Test rendering and user interactions
- **Thunks:** Mock API calls and test state changes

### Integration Tests
- Test full user flows (create → edit → delete)
- Test routing navigation

### Tools
- Jest - Test runner
- React Testing Library - Component testing
- MSW (Mock Service Worker) - API mocking

## Common Patterns

### 1. Optimistic Updates
Update UI immediately, rollback on error:
```javascript
export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    // Optimistically update
    dispatch(goalSlice.actions.updateGoalOptimistic({ id, data }));

    try {
      return await goalService.updateGoal(id, data);
    } catch (error) {
      // Rollback on error
      dispatch(goalSlice.actions.revertGoalUpdate(id));
      return rejectWithValue(error.message);
    }
  }
);
```

### 2. Debounced Search
```javascript
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce((query) => dispatch(searchGoals(query)), 500),
  [dispatch]
);
```

### 3. Pagination
```javascript
const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
    page: 1,
    hasMore: true
  },
  reducers: {
    loadMore: (state) => { state.page += 1; }
  }
});
```

## Debugging

### Redux DevTools
Install Redux DevTools browser extension to:
- Inspect state changes
- Time-travel debugging
- Replay actions

### React DevTools
- Inspect component hierarchy
- View Redux state in components
- Profile performance

### Logging
```javascript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => console.log('State:', store.getState()));
}
```

## Performance Optimization

### 1. Memoization
```javascript
import { useMemo } from 'react';

const sortedGoals = useMemo(
  () => [...goals].sort((a, b) => a.title.localeCompare(b.title)),
  [goals]
);
```

### 2. Code Splitting
```javascript
const ProjectsView = lazy(() => import('./views/ProjectsView'));

<Suspense fallback={<Loading />}>
  <ProjectsView />
</Suspense>
```

### 3. Selective Re-renders
```javascript
// Only re-render when specific state changes
const loading = useSelector(state => state.goals.loading);
const goals = useSelector(state => state.goals.goals);
```

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
