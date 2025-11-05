# Local Development Setup Guide

This guide will help you run the Goal Tracker application locally with Supabase.

## What's Running Locally

Your local development environment includes:

- **Supabase Stack** (via Docker):
  - PostgreSQL database (port 54322)
  - PostgREST API (port 54321)
  - Supabase Studio UI (port 54323)
  - Auth, Storage, Realtime services
  - Mailpit for email testing (port 54324)

- **Your Application**:
  - FastAPI Backend (port 8000)
  - React Frontend (port 80)

## Quick Start

### 1. Run the Application

**Recommended: Use the convenience script**
```bash
./run-local.sh
```

This will:
- Start local Supabase services (if not running)
- Configure environment for local development
- Start Docker containers for backend and frontend

**Alternative: Manual steps**
```bash
# Start Supabase
./bin/supabase start

# Copy local environment config
cp .env.local .env

# Start Docker Compose
docker-compose up --build
```

### 2. Install Backend Dependencies (Optional for direct Python development)

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run the Backend

**Option A: Direct Python (Recommended for Development)**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Option B: Docker Compose**
```bash
docker-compose up --build
```

### 4. Access Your Application

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Supabase Studio**: http://localhost:54323
- **Frontend**: http://localhost:80 (if using Docker Compose)

## Environment Configuration

Your [.env](.env) file is already configured for local development:

```env
ENVIRONMENT=local
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=8000
VITE_API_URL=http://localhost:8000
```

## Database Schema

The database schema is automatically applied when you start Supabase for the first time. It includes:

- **goals** table with sample data
- Row Level Security (RLS) enabled
- Permissive policy for local development

Migration file: [supabase/migrations/20250104000000_create_goals_table.sql](supabase/migrations/20250104000000_create_goals_table.sql)

## Testing the Connection

Run the test script to verify everything is working:

```bash
python3 test_supabase_sdk.py
```

You should see:
```
✓ All tests passed! Supabase SDK is working correctly.
```

## Common Commands

### Supabase Commands

```bash
# Start Supabase
./bin/supabase start

# Stop Supabase (keeps data)
./bin/supabase stop

# Stop and reset Supabase (deletes all data)
./bin/supabase stop --no-backup

# Check status
./bin/supabase status

# View logs
./bin/supabase logs

# Open Studio UI
open http://localhost:54323
```

### Backend Commands

```bash
# Run backend with hot reload
cd backend
uvicorn app.main:app --reload

# Run tests (if you add them)
pytest

# Check Python dependencies
pip list | grep supabase
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
```

## Accessing Supabase Studio

Open http://localhost:54323 in your browser to access the Supabase Studio dashboard.

From here you can:
- Browse your database tables
- Run SQL queries
- View and edit data
- Manage authentication settings
- Configure storage buckets
- Monitor real-time connections

## Working with the Database

### Using Supabase Studio

1. Open http://localhost:54323
2. Navigate to "Table Editor"
3. Select the "goals" table
4. You can view, add, edit, or delete records

### Using SQL Editor

1. Open http://localhost:54323
2. Navigate to "SQL Editor"
3. Run custom SQL queries:

```sql
-- View all goals
SELECT * FROM goals ORDER BY created_at DESC;

-- Add a new goal
INSERT INTO goals (title, description, status, target_date)
VALUES ('My New Goal', 'Description here', 'pending', NOW() + INTERVAL '7 days');

-- Update a goal
UPDATE goals SET status = 'completed' WHERE id = 1;
```

### Using the Python SDK

The FastAPI backend uses the Supabase Python SDK. Example usage:

```python
from supabase import Client

# Get all goals
response = supabase.table("goals").select("*").execute()
goals = response.data

# Create a goal
new_goal = {
    "title": "Learn FastAPI",
    "description": "Master FastAPI framework",
    "status": "in_progress"
}
response = supabase.table("goals").insert(new_goal).execute()

# Update a goal
response = supabase.table("goals").update({"status": "completed"}).eq("id", 1).execute()

# Delete a goal
response = supabase.table("goals").delete().eq("id", 1).execute()
```

## Creating Database Migrations

To make schema changes:

```bash
# Create a new migration
./bin/supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/

# Apply migrations
./bin/supabase migration up

# Or restart Supabase (auto-applies migrations)
./bin/supabase stop
./bin/supabase start
```

## Sample Data

The initial migration includes 3 sample goals:
1. Learn Supabase
2. Build Goal Tracker
3. Deploy to Production

You can reset to this state anytime:

```bash
./bin/supabase db reset
```

## Troubleshooting

### Port Already in Use

If ports 54321-54324 are already in use, stop the conflicting services:

```bash
# Find process using port
lsof -i :54321

# Stop Supabase and try again
./bin/supabase stop
./bin/supabase start
```

### Docker Issues

```bash
# Check Docker is running
docker ps

# Restart Docker Desktop and try again

# Clean up Docker containers
./bin/supabase stop --no-backup
docker system prune -f
```

### Connection Errors

1. Verify Supabase is running:
   ```bash
   ./bin/supabase status
   ```

2. Check your [.env](.env) file has correct values

3. Test connection:
   ```bash
   python3 test_supabase_sdk.py
   ```

### Import Errors

If you see `ImportError: cannot import name 'create_client'`:

```bash
pip install --user supabase==2.10.0 postgrest==0.18.0
```

## Switching Between Local and Production

### For Local Development

Use [.env](.env):
```env
ENVIRONMENT=local
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Production

Update [.env](.env):
```env
ENVIRONMENT=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
```

## Next Steps

1. Explore the Supabase Studio at http://localhost:54323
2. Test the API endpoints at http://localhost:8000/docs
3. Add authentication to your app
4. Implement real-time subscriptions
5. Add file upload with Supabase Storage

## Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/local-development)
- [Supabase Python SDK Docs](https://supabase.com/docs/reference/python)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Need Help?

- Check [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) for migration details
- View logs: `./bin/supabase logs`
- Check backend logs if running Docker: `docker-compose logs -f backend`
