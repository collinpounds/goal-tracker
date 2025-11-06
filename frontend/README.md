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
│   ├── main.jsx                       # Application entry point
│   ├── App.jsx                        # Root component with Redux Provider & auth listener
│   │
│   ├── lib/                           # Utility libraries
│   │   └── supabase.js                # Supabase client setup
│   │
│   ├── api/                           # API service layer
│   │   ├── goals.js                   # Goal API + axios interceptors
│   │   ├── teams.js                   # Team, invitation, notification services
│   │   └── categories.js              # Category API service
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── GoalCard.jsx               # Goal display with teams & categories
│   │   ├── GoalForm.jsx               # Goal create/edit with team/category selection
│   │   ├── Layout.jsx                 # Main layout with sidebar & top nav
│   │   ├── Sidebar.jsx                # Collapsible navigation with hierarchical teams
│   │   ├── ProtectedRoute.jsx         # Authentication wrapper
│   │   ├── TeamFormModal.jsx          # Team create/edit modal
│   │   ├── TeamTag.jsx                # Reusable team badge component
│   │   ├── CategoryFormModal.jsx      # Category create/edit modal
│   │   ├── CategoryTag.jsx            # Reusable category badge component
│   │   ├── NotificationPanel.jsx      # Notification dropdown with badge
│   │   ├── SearchAndFilterBar.jsx     # Search, filter, sort controls
│   │   ├── InviteMemberModal.jsx      # Team invitation modal
│   │   └── VersionDisplay.jsx         # App version display
│   │
│   ├── models/                        # Redux slices (state management)
│   │   ├── authSlice.js               # Authentication state & user session
│   │   ├── goalSlice.js               # Goals + filters + sorting state
│   │   ├── teamSlice.js               # Teams, members, invitations state
│   │   ├── categorySlice.js           # Categories state
│   │   └── notificationSlice.js       # Notifications state
│   │
│   ├── store/                         # Redux store configuration
│   │   └── index.js                   # Store setup with all reducers
│   │
│   ├── routes/                        # Router configuration
│   │   └── index.jsx                  # Route definitions
│   │
│   ├── views/                         # Page-level components
│   │   ├── GoalsView.jsx              # Main goals page (all/private/public tabs)
│   │   ├── TeamDetailsView.jsx        # Team page with goals & members tabs
│   │   ├── CategoryView.jsx           # Category goals view
│   │   ├── ProfileView.jsx            # User profile & settings
│   │   ├── InviteView.jsx             # Accept team invitation via link
│   │   ├── LoginView.jsx              # Login page
│   │   ├── SignupView.jsx             # Signup page
│   │   └── NotFoundView.jsx           # 404 error page
│   │
│   └── index.css                      # Global styles with Tailwind
│
├── public/                            # Static assets
├── .env                               # Environment variables
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
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
- Automatic token refresh and error handling

### Goal Management
- **CRUD Operations**: Create, edit, update, and delete personal goals
- **Status Tracking**: Track goal status (Pending, In Progress, Completed)
- **Target Dates**: Set target completion dates
- **Visibility Control**: Mark goals as public or private
- **View Modes**: Filter goals by visibility (All/Private/Public tabs)
- **Team Assignment**: Assign goals to multiple teams
- **Category Organization**: Assign goals to multiple categories
- **Advanced Search**: Full-text search across goal titles and descriptions
- **Multi-Filter**: Filter by status (multi-select), categories (multi-select), target date ranges
- **Smart Sorting**: Sort by target_date, created_at, title, or status (asc/desc)
- **Optimistic Updates**: Instant UI feedback without waiting for server responses

### Categories & Organization
- **Custom Categories**: Create categories with custom names, colors (hex), and icons
- **Multi-Category Goals**: Assign multiple categories to a single goal
- **Category Views**: Dedicated page showing all goals in a category
- **Color-Coded Badges**: Visual category badges on goal cards
- **Category Management**: Edit and delete categories
- **Quick Creation**: Create categories on-the-fly from goal form

### Teams & Collaboration
- **Team Creation**: Create teams with names, descriptions, and custom color themes
- **Hierarchical Structure**: Nested teams up to 3 levels deep with visual indentation
- **Role Management**: Owner and member roles with appropriate permissions
- **Team Views**: Dedicated team pages with goals and members tabs
- **Invite Members**: Send invitations via email or shareable invite links
- **Member Management**: View team members with names, emails, and roles
- **Team Goals**: Assign goals to multiple teams, view team-specific goals
- **Color Themes**: 10 predefined color options for visual distinction
- **Collapsible Sidebar**: Toggle between full and icon-only navigation

### Invitations
- **Email Invitations**: Send team invitations to email addresses
- **Shareable Links**: Generate unique invite codes for link-based joining
- **Invitation Management**: View pending, accepted, declined invitations
- **One-Click Accept**: Accept invitations directly from notifications or invite page
- **Expiration Handling**: 7-day expiration with clear status indicators

### Notifications
- **Real-Time Updates**: Notification panel with unread count badge
- **Auto-Polling**: Check for new notifications every 30 seconds
- **Notification Types**:
  - Team invitations
  - New team members added
  - Members removed
  - Goal assignments
  - Goal completions
  - Team deletions
- **One-Click Actions**: Accept invitations directly from notifications
- **Mark as Read**: Individual or bulk mark as read
- **Interactive Panel**: Dropdown panel with scrollable list

### User Profile
- **Profile Editing**: Update first name, last name, email, phone number
- **Password Management**: Change password via email verification
- **Account Info**: View account creation and last sign-in dates
- **User Avatar**: Display user initials in avatar throughout app
- **Metadata Storage**: User information stored in Supabase Auth metadata

### UI/UX Features
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Dark Mode Support**: Tailwind CSS dark mode utilities
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no data exists
- **Confirmation Dialogs**: Prevent accidental deletions
- **Toast Notifications**: Success/error feedback (optional enhancement)
- **Keyboard Navigation**: Accessible navigation patterns

## State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: null | User,           // Current user object from Supabase
    session: null | Session,     // Current session with token
    loading: boolean,            // Auth loading state
    error: string | null         // Auth error message
  },
  goals: {
    goals: Goal[],               // User's goals
    publicGoals: Goal[],         // All public goals from all users
    loading: boolean,
    error: string | null,
    editingGoal: Goal | null,
    showForm: boolean,           // Form modal visibility
    activeTab: string,           // 'my-goals', 'private', 'public'
    filters: {
      search: string,            // Text search query
      status: string[],          // Status filter (multi-select)
      category_ids: number[],    // Category filter (multi-select)
      target_date_from: string,  // Date range start
      target_date_to: string,    // Date range end
      sort_by: string,           // Sort field (target_date, created_at, title, status)
      sort_order: string         // Sort direction (asc, desc)
    }
  },
  categories: {
    categories: Category[],      // User's categories
    selectedCategory: Category | null,
    categoryGoals: Goal[],       // Goals in selected category
    loading: boolean,
    error: string | null,
    showCategoryForm: boolean,
    editingCategory: Category | null
  },
  teams: {
    teams: Team[],                           // User's teams (hierarchical)
    teamMembers: { [teamId]: Member[] },     // Members by team ID
    teamGoals: { [teamId]: Goal[] },         // Goals by team ID
    teamInvitations: { [teamId]: Invitation[] },
    pendingInvitations: Invitation[],        // User's pending invites
    selectedTeamId: number | null,
    loading: boolean,
    error: string | null,
    showTeamForm: boolean,
    editingTeam: Team | null,
    showInviteModal: boolean,
    invitingTeamId: number | null,
    sidebarCollapsed: boolean                // Sidebar toggle state
  },
  notifications: {
    notifications: Notification[],
    unreadCount: number,                     // Badge count
    loading: boolean,
    error: string | null,
    panelOpen: boolean                       // Dropdown panel state
  }
}
```

### Key Redux Slices

#### authSlice ([authSlice.js](src/models/authSlice.js))
- `login(credentials)` - Authenticate user with email/password
- `signup(credentials)` - Create new user account
- `logout()` - Sign out user and clear session
- `checkSession()` - Verify existing session on app load
- `updateProfile(data)` - Update user profile metadata

#### goalSlice ([goalSlice.js](src/models/goalSlice.js))
- `fetchGoals(filters)` - Get goals with search, filter, sort
- `fetchPublicGoals()` - Get all public goals from all users
- `createGoal(data)` - Create new goal
- `updateGoal({id, data})` - Update existing goal (optimistic)
- `deleteGoal(id)` - Delete goal (optimistic)
- `assignGoalToTeams({goalId, teamIds})` - Assign goal to teams (batch)
- `setFilters(filters)` - Update search/filter/sort criteria
- `clearFilters()` - Reset all filters
- `setActiveTab(tab)` - Switch between all/private/public views

#### categorySlice ([categorySlice.js](src/models/categorySlice.js))
- `fetchCategories()` - Get user's categories
- `fetchCategoryGoals(categoryId)` - Get goals in category
- `createCategory(data)` - Create new category (name, color, icon)
- `updateCategory({id, data})` - Update category
- `deleteCategory(id)` - Delete category

#### teamSlice ([teamSlice.js](src/models/teamSlice.js))
- `fetchTeams()` - Get user's teams (hierarchical)
- `createTeam(data)` - Create new team
- `updateTeam({id, data})` - Update team (owners only)
- `deleteTeam(id)` - Delete team (owners only)
- `fetchTeamMembers(teamId)` - Get team members with user info
- `fetchTeamGoals(teamId)` - Get team goals
- `sendInvitation({teamId, email})` - Send email invitation
- `fetchTeamInvitations(teamId)` - Get team invitations
- `fetchPendingInvitations()` - Get user's pending invitations
- `acceptInvitation(id)` - Accept invitation
- `declineInvitation(id)` - Decline invitation
- `toggleSidebar()` - Collapse/expand sidebar

#### notificationSlice ([notificationSlice.js](src/models/notificationSlice.js))
- `fetchNotifications(unreadOnly)` - Get user notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `togglePanel()` - Show/hide notification dropdown

## Routing

Routing is configured in [routes/index.jsx](src/routes/index.jsx) using React Router v6.

### Public Routes
- `/login` - Login page ([LoginView.jsx](src/views/LoginView.jsx))
- `/signup` - Signup page ([SignupView.jsx](src/views/SignupView.jsx))
- `/invite/:inviteCode` - Accept team invitation via shareable link ([InviteView.jsx](src/views/InviteView.jsx))

### Protected Routes (require authentication)
All protected routes are wrapped in [ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) and use the [Layout.jsx](src/components/Layout.jsx) component:

- `/` - Redirects to `/goals`
- `/goals` - All goals view with tabs (all/private/public) ([GoalsView.jsx](src/views/GoalsView.jsx))
- `/goals/private` - Private goals only (same component, different tab)
- `/goals/public` - Public goals from all users (same component, different tab)
- `/teams/:teamId` - Team details with goals & members tabs ([TeamDetailsView.jsx](src/views/TeamDetailsView.jsx))
- `/categories/:categoryId` - Category goals view ([CategoryView.jsx](src/views/CategoryView.jsx))
- `/profile` - User profile settings ([ProfileView.jsx](src/views/ProfileView.jsx))
- `*` - 404 Not Found ([NotFoundView.jsx](src/views/NotFoundView.jsx))

### Route Guards
- **ProtectedRoute** component wraps all authenticated routes
- Redirects to `/login` if not authenticated
- Checks session on component mount
- Preserves intended destination for redirect after login

## Components

### Layout Components
- **[Layout.jsx](src/components/Layout.jsx)** - Main app layout with sidebar, top nav, and notification bell
- **[Sidebar.jsx](src/components/Sidebar.jsx)** - Collapsible navigation with hierarchical teams and category list
- **[NotificationPanel.jsx](src/components/NotificationPanel.jsx)** - Dropdown notification panel with unread badge
- **[VersionDisplay.jsx](src/components/VersionDisplay.jsx)** - App version display in footer

### Goal Components
- **[GoalCard.jsx](src/components/GoalCard.jsx)** - Goal display card with team/category badges, status dropdown, and actions
- **[GoalForm.jsx](src/components/GoalForm.jsx)** - Create/edit goal modal with team and category multi-select
- **[SearchAndFilterBar.jsx](src/components/SearchAndFilterBar.jsx)** - Search box with filter/sort controls

### Team Components
- **[TeamFormModal.jsx](src/components/TeamFormModal.jsx)** - Create/edit team modal with color picker and parent selection
- **[TeamTag.jsx](src/components/TeamTag.jsx)** - Reusable team badge with custom color
- **[InviteMemberModal.jsx](src/components/InviteMemberModal.jsx)** - Team invitation modal with email input and link generation

### Category Components
- **[CategoryFormModal.jsx](src/components/CategoryFormModal.jsx)** - Create/edit category modal with color and icon pickers
- **[CategoryTag.jsx](src/components/CategoryTag.jsx)** - Reusable category badge with custom color and icon

### Auth Components
- **[ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)** - HOC for authenticated routes with redirect logic
- **[LoginView.jsx](src/views/LoginView.jsx)** - Login form with email/password
- **[SignupView.jsx](src/views/SignupView.jsx)** - Signup form with profile fields

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
