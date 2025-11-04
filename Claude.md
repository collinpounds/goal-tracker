# Claude Instructions for Goal Tracker

## Project Overview

Goal Tracker is a full-stack web application for managing personal or professional goals. Users can create, update, track status, and delete goals with target dates. The application features a clean, modern UI with real-time updates.

**Key Features:**
- Create goals with title, description, target date
- Track goal status (pending, in_progress, completed)
- Update and delete goals
- Responsive design with Tailwind CSS

## Architecture

This is a containerized full-stack application with:
- **Backend:** FastAPI (Python) REST API
- **Frontend:** React 18 with Vite build tool
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Docker & Docker Compose
- **Styling:** Tailwind CSS

### Backend Structure

**Recommended Structure (Best Practices):**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization, middleware, includes routers
│   ├── config.py            # Environment variables and configuration
│   ├── dependencies.py      # Shared dependencies (e.g., get_supabase)
│   ├── models/              # Pydantic models (schemas)
│   │   ├── __init__.py
│   │   └── goal.py         # Goal, GoalCreate, GoalUpdate schemas
│   ├── routers/            # API route handlers (one file per resource)
│   │   ├── __init__.py
│   │   ├── goals.py        # All goal-related endpoints (includes CRUD logic)
│   │   └── health.py       # Health check and system endpoints
│   └── supabase_client.py  # Supabase client initialization
├── tests/                  # Test files mirroring app structure
├── Dockerfile
└── pyproject.toml          # Modern Python dependency management
```

**Key Principles:**
- **Modular Routers:** Each resource (goals, users, etc.) gets its own router file
- **Router Self-Contained:** Each router includes its route handlers and CRUD logic
- **Dependency Injection:** Shared dependencies defined in `dependencies.py`
- **Configuration Management:** All config in `config.py` using pydantic-settings
- **Scalability:** Easy to add new features by adding new router files

**Entry Point:** [backend/app/main.py](backend/app/main.py)

**Key Technologies:**
- FastAPI 0.109.0 - [Documentation](https://fastapi.tiangolo.com/)
- Uvicorn - [Documentation](https://www.uvicorn.org/)
- Pydantic 2.5.3 - [Documentation](https://docs.pydantic.dev/)
- Supabase Python Client 2.10.0 - [Documentation](https://supabase.com/docs/reference/python/introduction)
- Poetry or pip with pyproject.toml - [Documentation](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)

### Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx          # React app entry point
│   ├── App.jsx           # Main app component with state management
│   ├── api/
│   │   └── goals.js      # API service layer (axios)
│   ├── components/
│   │   ├── GoalCard.jsx  # Goal display component
│   │   └── GoalForm.jsx  # Create/edit goal form
│   └── index.css         # Tailwind imports
├── Dockerfile
├── package.json
└── vite.config.js
```

**Entry Point:** [frontend/src/main.jsx](frontend/src/main.jsx)

**Key Technologies:**
- React 18.2.0 - [Documentation](https://react.dev/)
- Vite 5.0.11 - [Documentation](https://vitejs.dev/)
- Axios 1.6.5 - [Documentation](https://axios-http.com/)
- Tailwind CSS 3.4.1 - [Documentation](https://tailwindcss.com/)

**State Management:** Local React state using `useState` and `useEffect` hooks (no Redux/Context API currently)

### Database

**Type:** PostgreSQL (hosted on Supabase)

**Schema:**
- **Table:** `goals`
  - `id` (integer, primary key)
  - `title` (string, max 200 chars, required)
  - `description` (text, optional)
  - `status` (enum: pending, in_progress, completed)
  - `target_date` (datetime, optional)
  - `created_at` (datetime, auto-generated)

**Database Documentation:**
- Supabase - [Documentation](https://supabase.com/docs)
- PostgreSQL - [Documentation](https://www.postgresql.org/docs/)

## Development Workflow

### Local Setup

1. **Prerequisites:** Docker, Docker Compose
2. **Clone repository**
3. **Create `.env` file** (see Environment Variables section)
4. **Run:** `docker-compose up --build`
5. **Access:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Environment Variables

Required in `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Backend Configuration
PORT=8000

# Frontend Configuration
VITE_API_URL=http://localhost:8000

# Environment
ENVIRONMENT=production  # or development
```

**Security Note:** Never commit `.env` files. The anon key is safe for client-side use but keep service role keys secret.

### Docker Configuration

**Services:**
- `backend` - FastAPI server on port 8000
- `frontend` - Nginx serving React build on port 80

**Network:** Both services on `app_network` bridge network

**Healthcheck:** Backend has health endpoint at `/health`

**Docker Documentation:**
- Docker - [Documentation](https://docs.docker.com/)
- Docker Compose - [Documentation](https://docs.docker.com/compose/)

## Code Style and Conventions

### Backend Conventions

- **Language:** Python 3.11+
- **Async/Await:** Use async functions for all database operations
- **Type Hints:** Use Pydantic models for request/response validation
- **Naming:**
  - Functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Error Handling:** Raise `HTTPException` with appropriate status codes
- **Dependencies:** Use FastAPI's `Depends()` for dependency injection

**Python Style Guide:** [PEP 8](https://peps.python.org/pep-0008/)

### Frontend Conventions

- **Language:** JavaScript (JSX)
- **Components:** Functional components with hooks
- **Naming:**
  - Components: `PascalCase` (e.g., `GoalCard.jsx`)
  - Functions: `camelCase`
  - Files: Match component name
- **Props:** Destructure props in function signature
- **State:** Keep state close to where it's used; lift up when shared
- **API Calls:** Centralize in `api/` directory, use async/await

**React Style Guide:** [React Documentation](https://react.dev/learn/thinking-in-react)

### Git Workflow

<!-- Branch naming, commit message style, PR process - Fill in based on your preferences -->

## Testing Strategy

<!-- Testing approach, how to run tests, where test files live - To be implemented -->

## API Documentation

**Base URL:** `http://localhost:8000/api`

**Endpoints:**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/goals` | Get all goals | - | `Goal[]` |
| GET | `/api/goals/{id}` | Get single goal | - | `Goal` |
| POST | `/api/goals` | Create goal | `GoalCreate` | `Goal` |
| PUT | `/api/goals/{id}` | Update goal | `GoalUpdate` | `Goal` |
| DELETE | `/api/goals/{id}` | Delete goal | - | 204 No Content |

**Models:**

```python
GoalCreate:
  - title: str (required, 1-200 chars)
  - description: str | None
  - status: "pending" | "in_progress" | "completed"
  - target_date: datetime | None

GoalUpdate: (all fields optional)
  - title: str | None
  - description: str | None
  - status: str | None
  - target_date: datetime | None
```

**Interactive API Docs:** http://localhost:8000/docs (FastAPI auto-generated Swagger UI)

**FastAPI Documentation:** [FastAPI - First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)

## Common Tasks

### Adding a New Feature

1. **Backend (Recommended Structure):**
   - Add/modify Pydantic models in `app/models/` (e.g., `app/models/goal.py`)
   - Create route handlers with CRUD logic in `app/routers/` (e.g., `app/routers/goals.py`)
   - Include new router in `app/main.py` using `app.include_router()`
   - Update database schema if needed (see Database Changes)

2. **Frontend:**
   - Create/modify components in `components/`
   - Add API service functions in `api/`
   - Update `App.jsx` state management if needed
   - Style with Tailwind utility classes

3. **Test locally** with `docker-compose up --build`

**Example: Adding a new "Projects" feature**
- Create `app/models/project.py` with ProjectCreate, ProjectUpdate schemas
- Create `app/routers/projects.py` with all project endpoints and CRUD operations
- In `app/main.py`: `app.include_router(projects.router, prefix="/api", tags=["projects"])`

### Database Changes

1. Modify Supabase schema via Supabase Dashboard or SQL Editor
2. Update Pydantic models in [backend/app/models/](backend/app/models/) (e.g., `goal.py`)
3. Update corresponding router CRUD logic in [backend/app/routers/](backend/app/routers/)

**Note:** Using Supabase as the source of truth for database schema. Make all schema changes directly in Supabase Dashboard.

### Migrating from requirements.txt to pyproject.toml

**Why pyproject.toml?**
- Modern Python standard (PEP 518, 621)
- Single source of truth for project metadata and dependencies
- Better dependency resolution
- Supports development dependencies separately
- Compatible with pip, poetry, and other tools

**Example pyproject.toml structure:**
```toml
[project]
name = "goal-tracker-backend"
version = "1.0.0"
description = "Goal Tracker FastAPI Backend"
requires-python = ">=3.11"
dependencies = [
    "fastapi==0.109.0",
    "uvicorn[standard]==0.27.0",
    "pydantic==2.5.3",
    "pydantic-settings==2.1.0",
    "python-dotenv==1.0.0",
    "supabase==2.10.0",
    "postgrest==0.18.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.build_meta"

[tool.black]
line-length = 100
target-version = ["py311"]

[tool.ruff]
line-length = 100
target-version = "py311"
```

**Installation commands:**
```bash
# Install dependencies
pip install -e .

# Install with dev dependencies
pip install -e ".[dev]"

# Or using the old requirements.txt style
pip install .
```

**Dockerfile update for pyproject.toml:**
```dockerfile
# Copy pyproject.toml instead of requirements.txt
COPY pyproject.toml .
RUN pip install --no-cache-dir .
```

**pyproject.toml Documentation:** [Python Packaging Guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)

### Debugging

- **Backend Logs:** `docker-compose logs -f backend`
- **Frontend Logs:** `docker-compose logs -f frontend`
- **API Testing:** Use http://localhost:8000/docs for interactive testing
- **Database:** Check Supabase dashboard for data/query issues
- **CORS Issues:** Check `allow_origins` in [backend/app/main.py:16](backend/app/main.py#L16)

## Important Constraints and Requirements

### Security
- ⚠️ **CORS:** Currently set to `allow_origins=["*"]` - configure appropriately for production
- ⚠️ **Authentication:** Not implemented - add before production deployment
- Never commit `.env` files or credentials
- Use environment variables for all sensitive data
- Validate all user inputs (Pydantic handles this on backend)

### Performance
- Keep components lightweight and avoid unnecessary re-renders
- Use React keys properly in lists
- Minimize API calls (consider caching for production)

### Code Quality
- Keep functions small and focused (single responsibility)
- Use meaningful variable names
- Comment complex logic
- Handle errors gracefully with user-friendly messages

## Troubleshooting

### Docker Issues
- **Port conflicts:** Ensure ports 80 and 8000 are available
- **Build failures:** Try `docker-compose down -v && docker-compose up --build`
- **Permission errors:** Check Docker has proper permissions

### API Connection Issues
- Verify `VITE_API_URL` matches backend URL
- Check CORS configuration in backend
- Ensure backend container is healthy: `docker-compose ps`

### Supabase Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify table name is `goals` (lowercase)
- Check Row Level Security (RLS) policies in Supabase

### Frontend Build Issues
- Clear node_modules: `cd frontend && rm -rf node_modules && npm install`
- Check Node.js version compatibility

## Technology Stack Reference

### Core Technologies
- **FastAPI** - [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- **React** - [https://react.dev/](https://react.dev/)
- **Vite** - [https://vitejs.dev/](https://vitejs.dev/)
- **Supabase** - [https://supabase.com/docs](https://supabase.com/docs)
- **Docker** - [https://docs.docker.com/](https://docs.docker.com/)
- **Tailwind CSS** - [https://tailwindcss.com/](https://tailwindcss.com/)

### Python Libraries
- **Pydantic** - [https://docs.pydantic.dev/](https://docs.pydantic.dev/)
- **Uvicorn** - [https://www.uvicorn.org/](https://www.uvicorn.org/)

### JavaScript Libraries
- **Axios** - [https://axios-http.com/](https://axios-http.com/)

### Guides & Tutorials
- **FastAPI Tutorial** - [https://fastapi.tiangolo.com/tutorial/](https://fastapi.tiangolo.com/tutorial/)
- **React Quick Start** - [https://react.dev/learn](https://react.dev/learn)
- **Supabase Python Client** - [https://supabase.com/docs/reference/python/introduction](https://supabase.com/docs/reference/python/introduction)
- **Docker Compose Guide** - [https://docs.docker.com/compose/gettingstarted/](https://docs.docker.com/compose/gettingstarted/)

## Future Considerations

<!-- Planned features, technical debt, areas for improvement - Fill in based on your roadmap -->
