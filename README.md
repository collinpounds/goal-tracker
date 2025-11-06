# Goal Tracker App

A full-stack goal tracking application built with FastAPI, Supabase, React, and Docker. Features authentication, role-based access control (RBAC), and public/private goal sharing.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation using Python type annotations
- **Supabase Python SDK** - Direct database access and authentication
- **PostgreSQL** - Relational database (via Supabase)
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router 6** - Client-side routing
- **Vite** - Fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Axios** - HTTP client

### Database & Auth
- **Supabase** - PostgreSQL database with built-in Auth, RLS, and migrations
- **Row Level Security (RLS)** - Database-level authorization
- **JWT Authentication** - Secure token-based auth

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Google Cloud Run** - Serverless container deployment
- **GitHub Actions** - CI/CD pipeline with automatic migrations

## Project Structure

```
goal_tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app initialization & middleware
│   │   ├── config.py              # Environment configuration
│   │   ├── auth.py                # JWT authentication & user extraction
│   │   ├── supabase_client.py     # Supabase client setup
│   │   ├── models/                # Pydantic schemas with CRUD methods
│   │   │   ├── goal.py           # Goal models with search, filter, sort
│   │   │   ├── team.py           # Team, TeamMember, Invitation models
│   │   │   └── category.py       # Category models
│   │   └── routers/               # API route handlers
│   │       ├── health.py         # Health check endpoints
│   │       ├── goals.py          # Goal CRUD + category assignment (20+ endpoints)
│   │       ├── teams.py          # Team management, invites, notifications (25+ endpoints)
│   │       └── categories.py     # Category CRUD (7 endpoints)
│   ├── tests/
│   │   ├── test_integration.py   # 20+ integration tests
│   │   └── run_tests.sh          # Test runner script
│   ├── Dockerfile
│   └── pyproject.toml             # Modern Python dependency management
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Root component with Redux & auth listener
│   │   ├── lib/
│   │   │   └── supabase.js       # Supabase client initialization
│   │   ├── api/                   # API service layer
│   │   │   ├── goals.js          # Goal API + axios config
│   │   │   ├── teams.js          # Team, invitation, notification services
│   │   │   └── categories.js     # Category API service
│   │   ├── components/            # Reusable UI components
│   │   │   ├── GoalCard.jsx      # Goal display with teams & categories
│   │   │   ├── GoalForm.jsx      # Goal create/edit with team/category selection
│   │   │   ├── Layout.jsx        # Main layout with sidebar & top nav
│   │   │   ├── Sidebar.jsx       # Collapsible navigation with teams
│   │   │   ├── ProtectedRoute.jsx # Authentication wrapper
│   │   │   ├── TeamFormModal.jsx # Team create/edit modal
│   │   │   ├── TeamTag.jsx       # Reusable team badge
│   │   │   ├── CategoryFormModal.jsx # Category create/edit modal
│   │   │   ├── CategoryTag.jsx   # Reusable category badge
│   │   │   ├── NotificationPanel.jsx # Notification dropdown
│   │   │   └── SearchAndFilterBar.jsx # Search, filter, sort controls
│   │   ├── models/                # Redux slices
│   │   │   ├── authSlice.js      # Authentication state
│   │   │   ├── goalSlice.js      # Goals + filters + sorting
│   │   │   ├── teamSlice.js      # Teams, members, invitations
│   │   │   ├── categorySlice.js  # Categories
│   │   │   └── notificationSlice.js # Notifications
│   │   ├── store/                 # Redux store
│   │   │   └── index.js
│   │   ├── routes/                # Route configuration
│   │   │   └── index.jsx
│   │   └── views/                 # Page components
│   │       ├── GoalsView.jsx     # Main goals page (all/private/public)
│   │       ├── TeamDetailsView.jsx # Team page with goals & members tabs
│   │       ├── CategoryView.jsx  # Category goals view
│   │       ├── ProfileView.jsx   # User profile & settings
│   │       ├── InviteView.jsx    # Accept team invitation via link
│   │       ├── LoginView.jsx     # Login page
│   │       ├── SignupView.jsx    # Signup page
│   │       └── NotFoundView.jsx  # 404 page
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── supabase/
│   ├── config.toml                # Supabase configuration
│   └── migrations/                # Database migrations
│       ├── 20250104000000_create_goals_table.sql
│       ├── 20251105010103_add_auth.sql
│       ├── 20251105020000_add_is_public_to_goals.sql
│       ├── 20251105124500_add_teams_feature.sql
│       └── 20251106000000_add_categories_feature.sql
├── .github/
│   └── workflows/
│       └── deploy-cloudrun.yml    # CI/CD pipeline
├── docker-compose.yml
├── Dockerfile.cloudrun            # Unified production container
├── cloudbuild.yaml                # Cloud Build configuration
├── run-local.sh                   # Local development startup
├── run-production.sh              # Production mode locally
└── deploy-cloudrun.sh             # Manual Cloud Run deployment
```

## Features

### Goal Management
- **CRUD Operations**: Create, read, update, and delete goals
- **Status Tracking**: Track goal status (Pending, In Progress, Completed)
- **Target Dates**: Set target completion dates
- **Public/Private Goals**: Share goals publicly or keep them private
- **Team Assignment**: Assign goals to multiple teams for collaborative tracking
- **Category Organization**: Organize goals with custom categories (name, color, icon)
- **Advanced Search**: Full-text search across goal titles and descriptions
- **Multi-Filter**: Filter by status, categories, target date ranges
- **Smart Sorting**: Sort by target date, created date, title, or status (with null handling)

### Categories & Organization
- **Custom Categories**: Create categories with custom names, colors (hex), and icons
- **Multi-Category Goals**: Assign multiple categories to a single goal
- **Category Views**: View all goals within a specific category
- **Color-Coded Badges**: Visual category badges on goal cards
- **Unique Names**: Categories are unique per user

### Teams & Collaboration
- **Team Creation**: Create hierarchical teams (up to 3 levels of nesting)
- **Team Members**: Invite users via email or shareable invite links
- **Role Management**: Owner and member roles with appropriate permissions
- **Team Goals**: Assign and track goals within team context
- **Nested Teams**: Organize teams hierarchically (parent-child relationships)
- **Color Themes**: Assign custom color themes to teams (10 predefined colors)
- **Team Views**: Dedicated team pages with goals and members tabs

### Notifications
- **Real-time Notifications**: Get notified of team invitations, member additions, and goal assignments
- **Notification Panel**: Interactive panel with unread count badge
- **One-Click Actions**: Accept invitations directly from notifications
- **Auto-polling**: Check for new notifications every 30 seconds

### User Profile
- **Profile Management**: Edit email, first name, last name, and phone number
- **User Metadata**: Store additional user information in Supabase Auth
- **Password Reset**: Change password via email verification
- **User Avatar**: Display user initials in avatar throughout app

### Security & Authentication
- **Secure Authentication**: JWT-based auth with Supabase Auth
- **Authorization**: Row Level Security (RLS) for database-level access control
- **Email Verification**: Verify user emails during signup
- **Role-based Access**: Owner and member roles for teams

### Technical Features
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Real-time Updates**: Redux state management for seamless UX
- **Database Migrations**: Version-controlled schema changes with Supabase CLI
- **CI/CD Pipeline**: Automatic deployment to Cloud Run with GitHub Actions

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Supabase CLI** (included in `bin/` directory)
- **Node.js 18+** (for local development without Docker)
- **Python 3.11+** (for local development without Docker)

## Quick Start

### Option 1: Run with Local Supabase (Recommended)

This runs a complete local Supabase stack (PostgreSQL, Auth, Studio UI) alongside your app:

```bash
# Start everything with one command
./run-local.sh
```

This will:
- Start local Supabase services (PostgreSQL, Auth, Studio)
- Apply database migrations automatically
- Start backend and frontend in Docker containers

**Access the application:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Supabase Studio**: http://localhost:54323

### Option 2: Run with Production Supabase

```bash
./run-production.sh
```

### Option 3: Manual Docker Compose

```bash
# Copy environment config
cp .env.local .env

# Start services
docker-compose up --build
```

### Stop the Application

```bash
docker-compose down

# Or stop everything including Supabase
./bin/supabase stop
docker-compose down
```

## Local Development (Without Docker)

For development without Docker, you'll need to run Supabase, backend, and frontend separately.

### 1. Start Supabase

```bash
./bin/supabase start
```

This provides local PostgreSQL, Auth, and Studio UI.

### 2. Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or use .env.local)
export SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_ANON_KEY="<from supabase status>"

# Run development server with hot reload
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at http://localhost:5173 (Vite dev server)

## Detailed Documentation

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete local development guide
- **[ENVIRONMENTS.md](ENVIRONMENTS.md)** - Environment configuration & switching
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Cloud Run deployment guide
- **[AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)** - Authentication & RBAC details
- **[CLAUDE.md](CLAUDE.md)** - Project instructions for AI assistants

## API Endpoints

### Goals (20+ endpoints)
- `GET /api/goals` - Get all goals with search, filter, sort
  - Query params: `search`, `status[]`, `category_ids[]`, `target_date_from`, `target_date_to`, `sort_by`, `sort_order`
- `GET /api/goals/public` - Get all public goals from all users
- `GET /api/goals/{id}` - Get a specific goal
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal
- `POST /api/goals/{id}/categories` - Assign goal to categories (batch)
- `POST /api/goals/{id}/categories/{categoryId}` - Add single category
- `DELETE /api/goals/{id}/categories/{categoryId}` - Remove category from goal

### Categories (7 endpoints)
- `GET /api/categories` - Get all categories for current user
- `GET /api/categories/{id}` - Get category details
- `GET /api/categories/{id}/goals` - Get all goals in a category
- `POST /api/categories` - Create new category (name, color, icon)
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Teams (25+ endpoints)
**Teams:**
- `GET /api/teams` - Get all teams for current user
- `POST /api/teams` - Create a new team
- `GET /api/teams/{id}` - Get team details
- `PUT /api/teams/{id}` - Update team (owners only)
- `DELETE /api/teams/{id}` - Delete team (owners only)

**Team Members:**
- `GET /api/teams/{id}/members` - Get team members with user info
- `POST /api/teams/{id}/members` - Add team member (owners only)
- `PUT /api/teams/{id}/members/{userId}` - Update member role
- `DELETE /api/teams/{id}/members/{userId}` - Remove team member

**Team Goals:**
- `GET /api/teams/{id}/goals` - Get goals assigned to team
- `POST /api/goals/{goalId}/teams` - Assign goal to teams (batch)
- `DELETE /api/goals/{goalId}/teams/{teamId}` - Unassign goal from team

**Invitations:**
- `POST /api/teams/{id}/invite` - Send email invitation
- `GET /api/teams/{id}/invitations` - Get team invitations
- `GET /api/invitations` - Get user's pending invitations
- `POST /api/invitations/{id}/accept` - Accept invitation
- `POST /api/invitations/{id}/decline` - Decline invitation
- `GET /api/invite/{code}` - Get invitation by shareable code
- `POST /api/invite/{code}/join` - Join team via invite link

### Notifications
- `GET /api/notifications` - Get notifications (with `?unread=true` filter)
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Authentication & Profile
- Login/Signup handled by Supabase Auth client-side
- JWT token passed in `Authorization: Bearer <token>` header for all API requests

### Health Check
- `GET /health` - Health check endpoint
- `GET /api/health` - API health check

## Database Schema

The application uses 9 PostgreSQL tables with Row Level Security (RLS) policies:

### Goals Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | varchar(200) | Goal title (required) |
| description | text | Goal description (optional) |
| status | enum | pending, in_progress, completed |
| target_date | timestamptz | Target completion date (optional) |
| is_public | boolean | Public (true) or private (false), default: false |
| scope | enum | private, public, team |
| created_at | timestamptz | Creation timestamp (auto) |

### Categories Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | varchar(50) | Category name (unique per user) |
| color | varchar(7) | Hex color code (e.g., #FF5733) |
| icon | varchar(50) | Icon identifier |
| created_at | timestamptz | Creation timestamp |

### Goal Categories Table (Junction)
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| goal_id | bigint | Foreign key to goals |
| category_id | bigint | Foreign key to categories |
| - | - | Unique constraint: (goal_id, category_id) |

### Teams Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| name | varchar(100) | Team name (required) |
| description | text | Team description (optional) |
| color_theme | varchar(7) | Hex color code for UI |
| created_by | UUID | Team creator |
| parent_team_id | bigint | Parent team (nullable, for nesting) |
| nesting_level | int | 0-2 (max 3 levels deep) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| - | - | Unique constraint: (name, parent_team_id) |

### Team Members Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| team_id | bigint | Foreign key to teams |
| user_id | UUID | Foreign key to auth.users |
| role | enum | owner, member |
| invited_by | UUID | User who invited |
| joined_at | timestamptz | Join timestamp |
| - | - | Unique constraint: (team_id, user_id) |

### Goal Teams Table (Junction)
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| goal_id | bigint | Foreign key to goals |
| team_id | bigint | Foreign key to teams |
| assigned_by | UUID | User who assigned |
| assigned_at | timestamptz | Assignment timestamp |
| - | - | Unique constraint: (goal_id, team_id) |

### Team Invitations Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| team_id | bigint | Foreign key to teams |
| email | varchar(255) | Invitee email |
| invite_code | varchar(50) | Unique shareable code |
| invited_by | UUID | User who sent invite |
| status | enum | pending, accepted, declined, expired |
| created_at | timestamptz | Creation timestamp |
| expires_at | timestamptz | Expiration timestamp (+7 days) |

### Notifications Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| user_id | UUID | Foreign key to auth.users |
| type | enum | team_invitation, team_member_added, team_member_removed, team_goal_assigned, team_goal_completed, team_deleted |
| title | varchar(200) | Notification title |
| message | text | Notification message |
| related_id | bigint | Related entity ID (nullable) |
| read | boolean | Read status (default: false) |
| created_at | timestamptz | Creation timestamp |

### Database Features
- **Row Level Security (RLS)**: 20+ policies for secure data access
- **Indexes**: 12 indexes for optimized queries
- **Triggers**: Auto-add team owner, calculate nesting level, update timestamps
- **Cascade Deletes**: Properly configured foreign key relationships
- **Constraints**: Unique constraints on team names, category names, junction tables

## Deployment to Cloud Run

The application uses a **unified container** that includes both frontend and backend, deployed as a single Cloud Run service.

### Automatic Deployment (Recommended)

**GitHub Actions CI/CD** automatically deploys on push to `main`:

1. Runs database migrations to production Supabase
2. Builds unified Docker container
3. Deploys to Cloud Run
4. Runs health checks

See [.github/workflows/deploy-cloudrun.yml](.github/workflows/deploy-cloudrun.yml)

**Required GitHub Secrets:**
- `GCP_SA_KEY` - Google Cloud service account JSON
- `SUPABASE_ACCESS_TOKEN` - Supabase personal access token
- `SUPABASE_DB_PASSWORD` - Supabase database password

See [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) for setup instructions.

### Manual Deployment

```bash
# Quick deploy script
./deploy-cloudrun.sh
```

Or manually:

```bash
# Build and deploy with Cloud Build
gcloud builds submit \
  --config cloudbuild.yaml \
  --project goal-tracker-477205

# The service will be available at:
# https://goal-tracker-<hash>.run.app
```

### Architecture

The unified container serves:
- **Frontend**: React app (static files)
- **Backend**: FastAPI at `/api/*` and `/health`
- **Database**: Connects to production Supabase

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide.

## Environment Variables

### Backend (.env or .env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `http://127.0.0.1:54321` (local) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbG...` |
| `PORT` | Server port | `8000` |
| `ENVIRONMENT` | Environment name | `local` or `production` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

Environment files:
- `.env.local` - Local development with Supabase CLI
- `.env.production` - Production Supabase hosted instance
- Use `./run-local.sh` or `./run-production.sh` to switch automatically

## Development Tips

1. **Hot Reload**: Both frontend (Vite) and backend (uvicorn --reload) support hot reload
2. **API Documentation**: FastAPI automatically generates interactive docs at http://localhost:8000/docs
3. **Supabase Studio**: Access local database UI at http://localhost:54323
4. **Database Migrations**: Create with `./bin/supabase migration new <name>`, stored in `supabase/migrations/`
5. **State Management**: Redux DevTools extension recommended for debugging state
6. **Testing Auth**: Use Supabase Studio to manage test users and roles
7. **CORS**: Configured for `localhost:*` in development; production uses environment-specific origins

## State Management & Optimistic Updates

This application uses **optimistic updates** throughout the UI to provide instant feedback without waiting for server responses. This creates a smooth, responsive user experience.

### What are Optimistic Updates?

Optimistic updates mean the UI updates immediately when a user takes an action (like changing a goal's status), assuming the server request will succeed. The actual server response happens in the background, and Redux automatically handles the state synchronization.

**Benefits:**
- Instant UI feedback - no loading spinners or delays
- Only the affected component re-renders (no flash/refresh of entire page)
- Automatic rollback if server request fails (via Redux error handling)
- Consistent state across all views (goals page, team page, etc.)

### Implementation Pattern

#### 1. Redux Slices Handle State Updates

All CRUD operations use Redux Toolkit's `createAsyncThunk` which automatically handles three states:
- `pending` - Request started
- `fulfilled` - Request succeeded (updates state)
- `rejected` - Request failed (rollback or error handling)

Example from [goalSlice.js](frontend/src/models/goalSlice.js):

```javascript
export const updateGoal = createAsyncThunk('goals/updateGoal', async ({ id, goalData }) => {
  const response = await updateGoalAPI(id, goalData);
  return response.data;
});

// Redux automatically updates state when fulfilled
extraReducers: (builder) => {
  builder.addCase(updateGoal.fulfilled, (state, action) => {
    const index = state.goals.findIndex((g) => g.id === action.payload.id);
    if (index !== -1) {
      state.goals[index] = action.payload; // Optimistic update
    }
  });
}
```

#### 2. Cross-Slice Listeners for Consistency

The `teamSlice` listens to actions from `goalSlice` to keep team goals synchronized:

```javascript
// In teamSlice.js
extraReducers: (builder) => {
  // Listen to goal updates from goalSlice
  builder.addCase(updateGoal.fulfilled, (state, action) => {
    const updatedGoal = action.payload;
    // Update the goal in all team goals lists that contain it
    Object.keys(state.teamGoals).forEach((teamId) => {
      const goalIndex = state.teamGoals[teamId].findIndex((g) => g.id === updatedGoal.id);
      if (goalIndex !== -1) {
        state.teamGoals[teamId][goalIndex] = updatedGoal;
      }
    });
  });

  // Listen to goal deletions from goalSlice
  builder.addCase(deleteGoal.fulfilled, (state, action) => {
    const deletedGoalId = action.payload;
    // Remove the goal from all team goals lists
    Object.keys(state.teamGoals).forEach((teamId) => {
      state.teamGoals[teamId] = state.teamGoals[teamId].filter((g) => g.id !== deletedGoalId);
    });
  });
}
```

This ensures that when a goal is updated or deleted from **any** view (All Goals, Team Goals, etc.), the change is reflected **everywhere** instantly.

#### 3. Custom Hooks for Code Reuse

The `useGoalHandlers` hook ([useGoalHandlers.js](frontend/src/hooks/useGoalHandlers.js)) provides consistent goal operations across all components:

```javascript
export const useGoalHandlers = () => {
  const dispatch = useDispatch();

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    // Delete the goal - Redux will handle optimistic removal
    await dispatch(deleteGoal(goalId));

    // Redux automatically removes the goal from state:
    // - goalSlice.deleteGoal.fulfilled removes it from goals array
    // - teamSlice listens to deleteGoal.fulfilled and removes it from all team goals
  };

  const handleStatusChange = async (goalId, status) => {
    // Update the goal - Redux will handle optimistic update
    await dispatch(updateGoal({ id: goalId, goalData: { status } }));

    // Redux automatically updates the goal in state:
    // - goalSlice.updateGoal.fulfilled updates it in goals array
    // - teamSlice listens to updateGoal.fulfilled and updates it in all team goals
  };

  return { handleEdit, handleDelete, handleStatusChange };
};
```

**Key Point**: Notice there are **NO** manual `fetchGoals()` calls after operations. Redux handles all state updates automatically.

### When to Use fetchGoals()

**DO NOT** call `fetchGoals()` after:
- Creating a goal (unless assigning to teams - see below)
- Updating a goal
- Deleting a goal
- Changing goal status

These operations use optimistic updates via Redux reducers.

**DO** call `fetchGoals()` or `fetchTeamGoals()` when:
- Component first mounts (initial data load)
- Assigning goals to teams (team assignments are a separate operation)
- User explicitly refreshes the page

Example from [Layout.jsx](frontend/src/components/Layout.jsx):

```javascript
const handleCreateGoal = async (goalData) => {
  const { team_ids, ...goalDataWithoutTeams } = goalData;

  const result = await dispatch(createGoal(goalDataWithoutTeams));

  if (result.payload && team_ids && team_ids.length > 0) {
    const goalId = result.payload.id;
    await dispatch(assignGoalToTeams({ goalId, teamIds: team_ids }));

    // Only refresh team goals if we assigned to teams
    const teamIdMatch = location.pathname.match(/\/teams\/(\d+)/);
    if (teamIdMatch) {
      dispatch(fetchTeamGoals(parseInt(teamIdMatch[1])));
    }
  }

  // Redux already added the goal to state via createGoal.fulfilled
  // No need to fetchGoals() - it would cause unnecessary re-renders
};
```

### Best Practices for Future Features

When adding new features or components:

1. **Use Redux Thunks**: Create async thunks for all API operations
2. **Handle in extraReducers**: Update state in the `fulfilled` case
3. **Add Cross-Slice Listeners**: If the data appears in multiple slices, add listeners
4. **Use Custom Hooks**: Share common operations via hooks like `useGoalHandlers`
5. **Avoid Manual Fetches**: Trust Redux to update state automatically
6. **Only Fetch on Mount**: Load initial data when component mounts, not after every operation

### Example: Adding a New Feature with Optimistic Updates

If you're adding a new feature like "Comments on Goals":

1. **Create the async thunk** in `goalSlice.js`:
```javascript
export const addComment = createAsyncThunk('goals/addComment', async ({ goalId, comment }) => {
  const response = await addCommentAPI(goalId, comment);
  return response.data;
});
```

2. **Handle in reducer**:
```javascript
builder.addCase(addComment.fulfilled, (state, action) => {
  const { goalId, comment } = action.payload;
  const goal = state.goals.find(g => g.id === goalId);
  if (goal) {
    goal.comments = [...(goal.comments || []), comment];
  }
});
```

3. **Add cross-slice listener** if needed in `teamSlice.js`:
```javascript
builder.addCase(addComment.fulfilled, (state, action) => {
  const { goalId, comment } = action.payload;
  Object.keys(state.teamGoals).forEach((teamId) => {
    const goal = state.teamGoals[teamId].find(g => g.id === goalId);
    if (goal) {
      goal.comments = [...(goal.comments || []), comment];
    }
  });
});
```

4. **Use in component**:
```javascript
const handleAddComment = async (goalId, comment) => {
  await dispatch(addComment({ goalId, comment }));
  // That's it! Redux handles the rest. No manual fetch needed.
};
```

This pattern ensures:
- Instant UI updates
- Consistency across all views
- Minimal re-renders (only affected components update)
- Clean, maintainable code

## Troubleshooting

### Supabase Connection Issues

```bash
# Check if Supabase is running
./bin/supabase status

# Start Supabase if not running
./bin/supabase start

# Check Supabase logs
./bin/supabase logs
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs -f backend

# Verify environment variables
cat .env | grep SUPABASE

# Test Supabase connection
python3 test_supabase_sdk.py
```

### Frontend Not Loading

```bash
# Check if backend is healthy
curl http://localhost:8000/health

# Check frontend logs
docker-compose logs -f frontend

# Verify API URL configuration
grep VITE_API_URL .env
```

### Port Already in Use

If ports are in use:
- **80**: Frontend (modify in `docker-compose.yml`)
- **8000**: Backend API (modify `PORT` in `.env`)
- **54321-54324**: Supabase services (stop with `./bin/supabase stop`)

### Authentication Issues

- Check user exists in Supabase Studio at http://localhost:54323
- Verify user has a role in `public.user_roles` table
- Check RLS policies are enabled on goals table

## Project Documentation

This repository includes comprehensive documentation:

- **[README.md](README.md)** (this file) - Project overview and quick start
- **[CLAUDE.md](CLAUDE.md)** - Detailed project instructions for AI assistants
- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete local development guide
- **[ENVIRONMENTS.md](ENVIRONMENTS.md)** - Environment switching (local vs production)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Cloud Run deployment guide
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Quick deployment commands
- **[AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)** - Authentication & RBAC architecture
- **[GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)** - CI/CD secrets configuration
- **[SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md)** - Database migration guide
- **[frontend/MVC_ARCHITECTURE.md](frontend/MVC_ARCHITECTURE.md)** - Frontend architecture details

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally with `./run-local.sh`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions:
- Check the documentation files listed above
- Open an issue on the GitHub repository
- Review [TROUBLESHOOTING](#troubleshooting) section
