# Goal Tracker Frontend

A modern React application for goal tracking and team collaboration, built with Vite, Redux Toolkit, and Tailwind CSS.

## Tech Stack

- **React 18.2.0** - UI library with hooks
- **Vite 5.0.11** - Fast build tool and dev server
- **Redux Toolkit 2.0.1** - State management
- **React Redux 9.0.4** - React bindings for Redux
- **React Router 6.21.2** - Client-side routing
- **Axios 1.6.5** - HTTP client for API requests
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Supabase JS 2.39.3** - Supabase client for authentication

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                    # Application entry point
│   ├── App.jsx                     # Root component with Router
│   │
│   ├── api/                        # API service layer
│   │   ├── goals.js               # Goal API endpoints
│   │   └── teams.js               # Team, invitation, and notification APIs
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── GoalCard.jsx           # Goal display card
│   │   ├── GoalForm.jsx           # Goal creation/edit form
│   │   ├── Layout.jsx             # Main layout with sidebar
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── NotificationPanel.jsx  # Notification dropdown
│   │   ├── ProtectedRoute.jsx     # Auth route guard
│   │   ├── TeamFormModal.jsx      # Team creation/edit modal
│   │   └── InviteMemberModal.jsx  # Team invitation modal
│   │
│   ├── models/                     # Redux slices (state management)
│   │   ├── authSlice.js           # Auth state and user session
│   │   ├── goalSlice.js           # Goals state and operations
│   │   ├── teamSlice.js           # Teams, members, invitations
│   │   └── notificationSlice.js   # Notifications state
│   │
│   ├── store/                      # Redux store configuration
│   │   └── index.js               # Store setup with all reducers
│   │
│   ├── routes/                     # Router configuration
│   │   └── index.jsx              # Route definitions
│   │
│   ├── views/                      # Page-level components
│   │   ├── GoalsView.jsx          # Goals list (all/private/public)
│   │   ├── TeamDetailsView.jsx    # Team details with tabs
│   │   ├── ProfileView.jsx        # User profile settings
│   │   ├── LoginView.jsx          # Login page
│   │   ├── SignupView.jsx         # Signup page
│   │   └── NotFoundView.jsx       # 404 error page
│   │
│   ├── lib/                        # Utility libraries
│   │   └── supabase.js            # Supabase client setup
│   │
│   └── index.css                   # Global styles with Tailwind
│
├── public/                         # Static assets
├── .env                            # Environment variables
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Architecture

This application follows an **MVC (Model-View-Controller)** architecture using Redux Toolkit:

- **Models** (`models/`): Redux slices managing state and business logic
- **Views** (`views/`): Page-level components that compose UI
- **Controllers**: Embedded in Redux thunks for async operations and action creators for sync updates
- **Components** (`components/`): Reusable UI elements
- **API Layer** (`api/`): Centralized API service functions

See [MVC_ARCHITECTURE.md](MVC_ARCHITECTURE.md) for detailed architecture documentation.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [../backend/README.md](../backend/README.md))

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

Frontend will be available at http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the client.

## Features

### Authentication
- User signup and login with Supabase Auth
- JWT token-based authentication
- Protected routes requiring authentication
- Auto-redirect to login for unauthorized access
- Session persistence across page refreshes

### Goal Management
- Create, edit, update, and delete personal goals
- Track goal status (Pending, In Progress, Completed)
- Set target completion dates
- Mark goals as public or private
- Filter goals by visibility (All/Private/Public)
- Assign goals to teams

### Teams & Collaboration
- Create teams with names, descriptions, and color themes
- Hierarchical team structure (nested up to 3 levels)
- Invite members via email or shareable invite links
- View team members with their names and emails
- Manage team goals collaboratively
- Owner and member roles

### Notifications
- Real-time notification panel with unread count
- Notifications for:
  - Team invitations
  - New team members
  - Goal assignments
- One-click invitation acceptance
- Mark notifications as read
- Auto-polling every 30 seconds

### User Profile
- Edit profile information (name, email, phone)
- Change password via email
- View account creation and last sign-in dates
- User avatar with initials throughout app

## State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: null | User,      // Current user object
    loading: boolean,       // Auth loading state
    error: string | null    // Auth error message
  },
  goals: {
    goals: Goal[],          // Array of goals
    loading: boolean,
    error: string | null,
    showForm: boolean,      // Form visibility
    editingGoal: Goal | null
  },
  teams: {
    teams: Team[],                    // User's teams
    teamMembers: { [teamId]: Member[] }, // Members by team
    teamGoals: { [teamId]: Goal[] },     // Goals by team
    teamInvitations: { [teamId]: Invitation[] },
    pendingInvitations: Invitation[], // User's pending invites
    loading: boolean,
    error: string | null,
    showTeamForm: boolean,
    editingTeam: Team | null,
    showInviteModal: boolean,
    sidebarCollapsed: boolean
  },
  notifications: {
    notifications: Notification[],
    unreadCount: number,
    showPanel: boolean,
    loading: boolean,
    error: string | null
  }
}
```

### Key Redux Slices

#### authSlice
- `login(credentials)` - Authenticate user
- `signup(credentials)` - Create new user account
- `logout()` - Sign out user
- `checkSession()` - Verify existing session

#### goalSlice
- `fetchGoals()` - Get all goals
- `fetchPrivateGoals()` - Get private goals
- `fetchPublicGoals()` - Get public goals
- `createGoal(data)` - Create new goal
- `updateGoal({id, data})` - Update existing goal
- `deleteGoal(id)` - Delete goal
- `assignGoalToTeams({goalId, teamIds})` - Assign goal to teams

#### teamSlice
- `fetchTeams()` - Get user's teams
- `createTeam(data)` - Create new team
- `updateTeam({id, data})` - Update team
- `deleteTeam(id)` - Delete team
- `fetchTeamMembers(teamId)` - Get team members
- `fetchTeamGoals(teamId)` - Get team goals
- `sendInvitation({teamId, email})` - Send team invitation
- `fetchTeamInvitations(teamId)` - Get team invitations
- `acceptInvitation(id)` - Accept invitation
- `declineInvitation(id)` - Decline invitation

#### notificationSlice
- `fetchNotifications()` - Get user notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `togglePanel()` - Show/hide notification panel

## Routing

### Public Routes
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (require authentication)
- `/` - Redirects to `/goals`
- `/goals` - All goals view
- `/goals/private` - Private goals only
- `/goals/public` - Public goals only
- `/teams/:teamId` - Team details with goals/members tabs
- `/profile` - User profile settings

### Route Guards
- `ProtectedRoute` component wraps authenticated routes
- Redirects to `/login` if not authenticated
- Checks session on mount

## Components

### Layout Components
- **Layout** - Main app layout with sidebar and top nav
- **Sidebar** - Collapsible navigation with teams
- **NotificationPanel** - Dropdown panel for notifications

### Feature Components
- **GoalCard** - Display individual goal with actions
- **GoalForm** - Create/edit goal form
- **TeamFormModal** - Create/edit team modal
- **InviteMemberModal** - Team invitation modal

### Auth Components
- **ProtectedRoute** - HOC for authenticated routes
- **LoginView** - Login form
- **SignupView** - Signup form

## Styling

### Tailwind CSS
This project uses Tailwind CSS utility classes for styling:

```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>
```

### Custom Configuration
See [tailwind.config.js](tailwind.config.js) for customizations.

### Theme Colors
- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Yellow (#F59E0B)

## API Integration

### Axios Configuration
API client is configured in `api/goals.js` and `api/teams.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Functions
All API calls are centralized in service modules:

```javascript
// api/goals.js
export const goalService = {
  getAllGoals: () => api.get('/api/goals'),
  getGoalById: (id) => api.get(`/api/goals/${id}`),
  createGoal: (data) => api.post('/api/goals', data),
  updateGoal: (id, data) => api.put(`/api/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/api/goals/${id}`),
};
```

## Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR):
- Component changes reflect immediately
- State is preserved during updates
- CSS updates without full reload

### Redux DevTools
Install the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) to:
- Inspect state changes
- Time-travel debug
- Replay actions
- Export/import state

### React DevTools
Use [React DevTools](https://react.dev/learn/react-developer-tools) to:
- Inspect component hierarchy
- View props and state
- Profile performance
- Track re-renders

### Console Logging
Redux Toolkit enables console logging in development:
- Actions are logged with timestamps
- State changes are visible
- Errors show stack traces

## Common Tasks

### Adding a New Page

1. **Create View Component**
```javascript
// src/views/SettingsView.jsx
import { useDispatch, useSelector } from 'react-redux';

function SettingsView() {
  return <div>Settings Page</div>;
}

export default SettingsView;
```

2. **Add Route**
```javascript
// src/routes/index.jsx
import SettingsView from '../views/SettingsView';

{
  path: 'settings',
  element: <SettingsView />,
}
```

3. **Add Navigation Link**
```javascript
// src/components/Sidebar.jsx
<button onClick={() => navigate('/settings')}>
  Settings
</button>
```

### Adding a New Redux Slice

1. **Create Slice File**
```javascript
// src/models/settingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
  // API call
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      // Handle success
    });
  },
});

export default settingsSlice.reducer;
```

2. **Add to Store**
```javascript
// src/store/index.js
import settingsReducer from '../models/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalReducer,
    settings: settingsReducer, // Add here
  },
});
```

## Testing

### Unit Tests
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run Cypress tests
npm run test:e2e
```

## Troubleshooting

### Port Already in Use
If port 5173 is in use:
```bash
# Change port in vite.config.js
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### API Connection Issues
- Verify `VITE_API_URL` in `.env`
- Check backend is running on correct port
- Inspect network tab for CORS errors

### State Not Updating
- Check Redux DevTools for action dispatch
- Verify reducer is handling action
- Ensure component is subscribed with `useSelector`

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Performance Optimization

### Code Splitting
Use React lazy loading for routes:
```javascript
const SettingsView = lazy(() => import('./views/SettingsView'));

<Suspense fallback={<Loading />}>
  <SettingsView />
</Suspense>
```

### Memoization
Prevent unnecessary re-renders:
```javascript
import { useMemo, useCallback } from 'react';

const sortedGoals = useMemo(() => {
  return goals.sort((a, b) => a.title.localeCompare(b.title));
}, [goals]);
```

### Selective Redux Subscriptions
Only subscribe to needed state:
```javascript
// Bad - re-renders on any state change
const state = useSelector(state => state);

// Good - only re-renders when goals change
const goals = useSelector(state => state.goals.goals);
```

## Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

## License

MIT License - See main repository README for details.
