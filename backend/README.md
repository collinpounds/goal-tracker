# Goal Tracker Backend API

A modern, production-ready FastAPI backend for the Goal Tracker application. Built with Python 3.11+, FastAPI, and Supabase (PostgreSQL).

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Adding New Features](#adding-new-features)
- [Recommended Libraries](#recommended-libraries)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Docker and Docker Compose (for containerized deployment)
- Supabase account with a project set up

### Local Development Setup

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   PORT=8000
   ENVIRONMENT=development
   ```

5. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the API:**
   - API: http://localhost:8000
   - Interactive API Docs (Swagger UI): http://localhost:8000/docs
   - Alternative API Docs (ReDoc): http://localhost:8000/redoc
   - Health Check: http://localhost:8000/health

### Docker Deployment

```bash
# From the root directory
docker-compose up --build
```

---

## Architecture

This backend follows a **modular, router-based architecture** inspired by FastAPI best practices:

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│     FastAPI Application         │
│  ┌──────────────────────────┐  │
│  │   CORS Middleware        │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Routers (goals, etc)   │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Dependency Injection   │  │
│  │   (Supabase Client)      │  │
│  └──────────────────────────┘  │
└────────────┬────────────────────┘
             │
             ▼
      ┌──────────────┐
      │   Supabase   │
      │  (PostgreSQL)│
      └──────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Routers handle HTTP logic, models handle data validation and database operations
2. **Dependency Injection**: Shared dependencies (like Supabase client) injected via FastAPI's `Depends()`
3. **Pydantic Models**: Strong typing and automatic validation for all request/response data
4. **Async/Await**: Asynchronous operations for better performance
5. **Active Record Pattern**: Models contain their own CRUD methods for cleaner code organization

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization, CORS, router registration
│   ├── config.py                  # Environment variables and settings
│   ├── supabase_client.py         # Supabase client initialization and dependency
│   │
│   ├── models/                    # Pydantic models (schemas) with CRUD methods
│   │   ├── __init__.py
│   │   └── goal.py                # Goal, GoalCreate, GoalUpdate, GoalStatus
│   │
│   └── routers/                   # API route handlers
│       ├── __init__.py
│       ├── health.py              # Health check endpoints
│       └── goals.py               # Goal CRUD endpoints
│
├── tests/                         # Test files (mirror app structure)
│   ├── __init__.py
│   ├── test_goals.py
│   └── test_health.py
│
├── static/                        # Frontend build files (production only)
├── .env                           # Environment variables (not in version control)
├── Dockerfile                     # Docker container configuration
├── pyproject.toml                 # Project dependencies and metadata
└── README.md                      # This file
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `app/main.py` | Application entry point, middleware setup, router registration |
| `app/config.py` | Centralized configuration and environment variables |
| `app/supabase_client.py` | Supabase client singleton and dependency injection |
| `app/models/goal.py` | Goal data models with validation and database operations |
| `app/routers/goals.py` | Goal API endpoints (GET, POST, PUT, DELETE) |
| `app/routers/health.py` | System health and status endpoints |

---

## API Documentation

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: Your deployed URL

### Interactive Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs (try out API calls in the browser)
- **ReDoc**: http://localhost:8000/redoc (clean, readable documentation)
- **OpenAPI Schema**: http://localhost:8000/openapi.json (raw OpenAPI 3 specification)

### Endpoints Summary

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/goals` | List all goals | - | `Goal[]` |
| GET | `/api/goals/{id}` | Get single goal | - | `Goal` |
| POST | `/api/goals` | Create new goal | `GoalCreate` | `Goal` |
| PUT | `/api/goals/{id}` | Update goal | `GoalUpdate` | `Goal` |
| DELETE | `/api/goals/{id}` | Delete goal | - | 204 No Content |
| GET | `/health` | Health check | - | `{"status": "healthy"}` |
| GET | `/api/health/database` | Database health | - | `{"status": "ok", ...}` |

### Data Models

#### GoalCreate (Request)
```json
{
  "title": "Learn FastAPI",
  "description": "Complete the official FastAPI tutorial",
  "status": "pending",
  "target_date": "2025-12-31T00:00:00"
}
```

**Fields:**
- `title` (string, required): 1-200 characters
- `description` (string, optional): Detailed description
- `status` (string, optional): `"pending"` | `"in_progress"` | `"completed"` (default: `"pending"`)
- `target_date` (datetime, optional): ISO 8601 format

#### GoalUpdate (Request)
```json
{
  "title": "Learn FastAPI Advanced Topics",
  "status": "in_progress"
}
```

All fields are optional. Only provided fields will be updated.

#### Goal (Response)
```json
{
  "id": 1,
  "title": "Learn FastAPI",
  "description": "Complete the official FastAPI tutorial",
  "status": "in_progress",
  "target_date": "2025-12-31T00:00:00",
  "created_at": "2025-01-15T10:30:00"
}
```

### Example API Calls

**Create a Goal:**
```bash
curl -X POST http://localhost:8000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build a REST API",
    "description": "Create a production-ready API with FastAPI",
    "status": "in_progress",
    "target_date": "2025-06-01T00:00:00"
  }'
```

**Update a Goal:**
```bash
curl -X PUT http://localhost:8000/api/goals/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**List All Goals:**
```bash
curl http://localhost:8000/api/goals
```

---

## Development Guide

### Code Style

This project follows Python best practices and PEP 8:

- **Formatter**: Black (line length: 100)
- **Linter**: Ruff
- **Type Hints**: Required for all function signatures
- **Async/Await**: Use for all I/O operations

**Run formatters:**
```bash
black app/
ruff check app/ --fix
```

### Environment Variables

Managed via `app/config.py`. Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `PORT` | Server port | `8000` |
| `ENVIRONMENT` | Environment mode | `development` or `production` |

### Database Schema

**Table: `goals`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| `title` | varchar(200) | NOT NULL | Goal title |
| `description` | text | NULLABLE | Detailed description |
| `status` | varchar(50) | NOT NULL, DEFAULT 'pending' | Current status |
| `target_date` | timestamp | NULLABLE | Target completion date |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |

**Create table SQL:**
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Dependency Management

This project uses `pyproject.toml` (PEP 621) for modern Python dependency management.

**Install dependencies:**
```bash
pip install -e .              # Production dependencies only
pip install -e ".[dev]"       # Include dev dependencies
```

**Add a new dependency:**
1. Edit `pyproject.toml`
2. Add to `dependencies` array (production) or `[project.optional-dependencies.dev]` (development)
3. Run `pip install -e ".[dev]"`

---

## Adding New Features

### How to Add a New API Route

Follow these steps to add a new resource (e.g., "Tasks", "Projects"):

#### Step 1: Create the Data Model

Create `app/models/task.py`:

```python
"""
Task Pydantic models (schemas) with CRUD methods.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from supabase import Client


class TaskBase(BaseModel):
    """Base task schema."""
    name: str = Field(..., min_length=1, max_length=100)
    priority: int = Field(1, ge=1, le=5)
    goal_id: int


class TaskCreate(TaskBase):
    """Schema for creating a task."""

    async def save(self, supabase: Client) -> "Task":
        """Create a new task in the database."""
        task_data = {
            "name": self.name,
            "priority": self.priority,
            "goal_id": self.goal_id,
        }
        response = supabase.table("tasks").insert(task_data).execute()
        if response.data and len(response.data) > 0:
            return Task(**response.data[0])
        raise Exception("Failed to create task")


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    priority: Optional[int] = Field(None, ge=1, le=5)


class Task(TaskBase):
    """Complete task schema with database fields."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    async def get_all(cls, supabase: Client) -> List["Task"]:
        """Retrieve all tasks."""
        response = supabase.table("tasks").select("*").order("created_at", desc=True).execute()
        return [cls(**task) for task in response.data]

    @classmethod
    async def get_by_id(cls, supabase: Client, task_id: int) -> Optional["Task"]:
        """Retrieve a single task by ID."""
        response = supabase.table("tasks").select("*").eq("id", task_id).execute()
        if response.data and len(response.data) > 0:
            return cls(**response.data[0])
        return None

    async def update(self, supabase: Client, update_data: TaskUpdate) -> Optional["Task"]:
        """Update this task."""
        update_dict = {}
        if update_data.name is not None:
            update_dict["name"] = update_data.name
        if update_data.priority is not None:
            update_dict["priority"] = update_data.priority

        if not update_dict:
            return self

        response = supabase.table("tasks").update(update_dict).eq("id", self.id).execute()
        if response.data and len(response.data) > 0:
            return Task(**response.data[0])
        return None

    async def delete(self, supabase: Client) -> bool:
        """Delete this task."""
        supabase.table("tasks").delete().eq("id", self.id).execute()
        return True
```

#### Step 2: Create the Router

Create `app/routers/tasks.py`:

```python
"""
Tasks API router.
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List

from ..models.task import Task, TaskCreate, TaskUpdate
from ..supabase_client import get_supabase

router = APIRouter()


@router.get("/tasks", response_model=List[Task])
async def read_tasks(supabase: Client = Depends(get_supabase)):
    """
    Get all tasks.

    Returns a list of all tasks ordered by creation date (newest first).
    """
    tasks = await Task.get_all(supabase)
    return tasks


@router.get("/tasks/{task_id}", response_model=Task)
async def read_task(task_id: int, supabase: Client = Depends(get_supabase)):
    """
    Get a single task by ID.

    Args:
        task_id: The unique identifier of the task

    Returns:
        The requested task

    Raises:
        404: Task not found
    """
    task = await Task.get_by_id(supabase, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate, supabase: Client = Depends(get_supabase)):
    """
    Create a new task.

    Args:
        task_data: Task creation data

    Returns:
        The created task with generated ID and timestamps
    """
    return await task_data.save(supabase)


@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    supabase: Client = Depends(get_supabase)
):
    """
    Update an existing task.

    Args:
        task_id: The unique identifier of the task
        task_data: Fields to update (all optional)

    Returns:
        The updated task

    Raises:
        404: Task not found
    """
    task = await Task.get_by_id(supabase, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    updated_task = await task.update(supabase, task_data)
    if updated_task is None:
        raise HTTPException(status_code=500, detail="Failed to update task")

    return updated_task


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: int, supabase: Client = Depends(get_supabase)):
    """
    Delete a task.

    Args:
        task_id: The unique identifier of the task

    Raises:
        404: Task not found
    """
    task = await Task.get_by_id(supabase, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    await task.delete(supabase)
    return None
```

#### Step 3: Register the Router

In `app/main.py`, add:

```python
from .routers import goals, health, tasks  # Add tasks import

# Include routers
app.include_router(health.router, prefix="/api", tags=["tasks"])
app.include_router(goals.router, prefix="/api", tags=["goals"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])  # Add this line
```

#### Step 4: Create Database Table

In Supabase SQL Editor:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
```

#### Step 5: Test Your New Endpoints

1. Restart the server
2. Visit http://localhost:8000/docs
3. You should see your new "tasks" endpoints in the Swagger UI
4. Test creating, reading, updating, and deleting tasks

---

## Recommended Libraries

### Core Dependencies (Production)

| Library | Version | Purpose | Documentation |
|---------|---------|---------|---------------|
| **FastAPI** | 0.109.0 | Modern, high-performance web framework | [docs](https://fastapi.tiangolo.com/) |
| **Uvicorn** | 0.27.0 | ASGI server for running FastAPI | [docs](https://www.uvicorn.org/) |
| **Pydantic** | 2.5.3 | Data validation and settings management | [docs](https://docs.pydantic.dev/) |
| **pydantic-settings** | 2.1.0 | Settings management with Pydantic | [docs](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) |
| **python-dotenv** | 1.0.0 | Load environment variables from .env | [docs](https://pypi.org/project/python-dotenv/) |
| **supabase** | 2.10.0 | Supabase Python client | [docs](https://supabase.com/docs/reference/python/introduction) |
| **postgrest** | 0.18.0 | PostgREST client (Supabase dependency) | [docs](https://postgrest.org/) |

### Development Dependencies

| Library | Version | Purpose | Documentation |
|---------|---------|---------|---------------|
| **pytest** | 7.4.0+ | Testing framework | [docs](https://docs.pytest.org/) |
| **pytest-asyncio** | 0.21.0+ | Async test support | [docs](https://pytest-asyncio.readthedocs.io/) |
| **black** | 23.0.0+ | Code formatter | [docs](https://black.readthedocs.io/) |
| **ruff** | 0.1.0+ | Fast Python linter | [docs](https://docs.astral.sh/ruff/) |
| **httpx** | - | Async HTTP client for testing | [docs](https://www.python-httpx.org/) |

### Recommended Additional Libraries

**For Authentication:**
```toml
# Add to pyproject.toml dependencies
"python-jose[cryptography]>=3.3.0",
"passlib[bcrypt]>=1.7.4",
"python-multipart>=0.0.6",
```

- `python-jose[cryptography]` - JWT tokens
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data parsing

**For Database Migrations:**
- `alembic` - Database migrations (if not using Supabase migrations)

**For Advanced Validation:**
- `email-validator` - Email validation
- `phonenumbers` - Phone number validation

**For Background Tasks:**
- `celery` - Distributed task queue
- `redis` - In-memory data store (for Celery backend)

**For Monitoring:**
- `prometheus-fastapi-instrumentator` - Prometheus metrics
- `sentry-sdk[fastapi]` - Error tracking

---

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_goals.py

# Run with verbose output
pytest -v
```

### Writing Tests

Create test files in the `tests/` directory, mirroring the `app/` structure.

**Example: `tests/test_goals.py`**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_goal():
    """Test creating a new goal."""
    response = client.post(
        "/api/goals",
        json={
            "title": "Test Goal",
            "description": "Test description",
            "status": "pending",
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Goal"
    assert "id" in data


def test_get_goals():
    """Test retrieving all goals."""
    response = client.get("/api/goals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_goal_not_found():
    """Test getting a non-existent goal."""
    response = client.get("/api/goals/99999")
    assert response.status_code == 404
```

---

## Deployment

### Docker Deployment

**Build and run:**
```bash
docker-compose up --build
```

**Environment variables in Docker:**
Create `.env` file in the root directory (see [Quick Start](#quick-start)).

### Production Considerations

1. **Security:**
   - Set `ENVIRONMENT=production` in `.env`
   - Configure CORS origins in `app/config.py`
   - Use HTTPS/TLS in production
   - Keep Supabase keys secret (never commit to version control)
   - Implement authentication and authorization

2. **Performance:**
   - Use Uvicorn with Gunicorn for multiple workers:
     ```bash
     gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
     ```
   - Enable database connection pooling
   - Implement caching (Redis) for frequently accessed data

3. **Monitoring:**
   - Set up application logging
   - Monitor health endpoints
   - Use APM tools (New Relic, Datadog, etc.)
   - Track error rates and response times

---

## Troubleshooting

### Common Issues

**Problem: "ModuleNotFoundError: No module named 'app'"**
- **Solution**: Install the package in editable mode: `pip install -e .`

**Problem: "Supabase connection error"**
- **Solution**:
  - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
  - Check network connectivity
  - Ensure Supabase project is active

**Problem: "CORS policy error"**
- **Solution**:
  - Check `CORS_ORIGINS` in `app/config.py`
  - Ensure frontend URL is whitelisted
  - Verify `ENVIRONMENT` variable is set correctly

**Problem: "Port 8000 already in use"**
- **Solution**:
  - Change `PORT` in `.env`
  - Kill existing process: `lsof -ti:8000 | xargs kill -9` (macOS/Linux)

**Problem: "Docker build fails"**
- **Solution**:
  - Clear Docker cache: `docker-compose down -v`
  - Rebuild: `docker-compose up --build`
  - Check Dockerfile syntax

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Questions or Issues?** Open an issue in the repository or check the [Troubleshooting](#troubleshooting) section.
