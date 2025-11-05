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
│   │   ├── main.py              # FastAPI app initialization & middleware
│   │   ├── config.py            # Environment configuration
│   │   ├── dependencies.py      # Shared dependencies
│   │   ├── supabase_client.py   # Supabase client setup
│   │   ├── models/              # Pydantic schemas
│   │   │   └── goal.py          # Goal models
│   │   └── routers/             # API route handlers
│   │       ├── goals.py         # Goal CRUD endpoints
│   │       └── health.py        # Health check
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component with Router
│   │   ├── api/                 # API service layer
│   │   │   └── goals.js         # Goal API calls
│   │   ├── components/          # Reusable UI components
│   │   │   ├── GoalCard.jsx
│   │   │   └── GoalForm.jsx
│   │   ├── models/              # Redux state management
│   │   │   └── goalSlice.js     # Goal state & thunks
│   │   ├── store/               # Redux store
│   │   │   └── index.js
│   │   ├── routes/              # Route configuration
│   │   │   └── index.jsx
│   │   └── views/               # Page components
│   │       └── GoalsView.jsx
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── supabase/
│   ├── config.toml              # Supabase configuration
│   └── migrations/              # Database migrations
│       ├── 20250104000000_create_goals_table.sql
│       ├── 20251105010103_add_auth.sql
│       └── 20251105020000_add_is_public_to_goals.sql
├── .github/
│   └── workflows/
│       └── deploy-cloudrun.yml  # CI/CD pipeline
├── docker-compose.yml
├── Dockerfile.cloudrun          # Unified production container
├── cloudbuild.yaml              # Cloud Build configuration
├── run-local.sh                 # Local development startup
├── run-production.sh            # Production mode locally
└── deploy-cloudrun.sh           # Manual Cloud Run deployment
```

## Features

- **Goal Management**: Create, read, update, and delete goals
- **Status Tracking**: Track goal status (Pending, In Progress, Completed)
- **Target Dates**: Set target completion dates
- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Role-based access control (RBAC) with admin and user roles
- **Public/Private Goals**: Share goals publicly or keep them private
- **Row Level Security**: Database-level security policies
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

### Goals

- `GET /api/goals` - Get all goals
- `GET /api/goals/{id}` - Get a specific goal
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

### Health Check

- `GET /health` - Health check endpoint
- `GET /` - API root

## Database Schema

### Goals Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key (auto-increment) |
| title | String(200) | Goal title (required) |
| description | Text | Goal description (optional) |
| status | Enum | pending, in_progress, completed |
| target_date | Timestamp | Target completion date (optional) |
| is_public | Boolean | Public (true) or private (false) |
| user_id | UUID | Foreign key to auth.users |
| created_at | Timestamp | Creation timestamp (auto) |

### User Roles

Managed in `public.user_roles` table:
- **admin**: Full access to all goals
- **user**: Access to own goals only

Row Level Security (RLS) policies enforce authorization at the database level.

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
