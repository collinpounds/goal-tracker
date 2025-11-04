# Supabase Migration Guide

This project has been migrated from using a local PostgreSQL Docker container with SQLAlchemy to using **Supabase** with the official Python SDK.

## What Changed

### Removed
- ❌ Local PostgreSQL Docker container
- ❌ SQLAlchemy ORM
- ❌ Alembic migrations
- ❌ asyncpg and psycopg2-binary dependencies

### Added
- ✅ Supabase Python SDK (`supabase-py`)
- ✅ PostgREST client for database operations
- ✅ Simplified CRUD operations
- ✅ Built-in Row Level Security (RLS) support
- ✅ Future support for Auth, Storage, and Realtime features

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in the Supabase dashboard
3. **Database Table**: Create the `goals` table using the SQL below

### Database Schema

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for your auth needs)
CREATE POLICY "Allow all operations for now" ON goals
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: In production, replace the above policy with proper auth-based policies
-- Example with auth:
-- CREATE POLICY "Users can only see their own goals" ON goals
--     FOR SELECT
--     USING (auth.uid() = user_id);
```

## Configuration

### 1. Get Your Supabase Credentials

From your Supabase Dashboard:
1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon/public** key (under "Project API keys")

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy from example
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
ENVIRONMENT=production

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Backend Configuration
PORT=8000

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Local Development Options

### Option 1: Use Hosted Supabase (Recommended for simplicity)

Just use your cloud Supabase credentials in `.env` as shown above.

### Option 2: Use Local Supabase (Optional)

If you want to run Supabase locally:

1. **Install Supabase CLI**:
   ```bash
   # macOS/Linux
   brew install supabase/tap/supabase

   # Windows (Scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Initialize and Start**:
   ```bash
   supabase init
   supabase start
   ```

3. **Update `.env`** for local development:
   ```env
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

4. **Access Local Studio**: http://localhost:54323

## Testing the Connection

Test your Supabase connection:

```bash
python3 test_supabase_sdk.py
```

You should see:
```
✓ All tests passed! Supabase SDK is working correctly.
```

## Running the Application

### With Docker Compose

```bash
# Build and start services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The backend will be available at: http://localhost:8000

### Without Docker (Direct Python)

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

All endpoints remain the same:

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/goals` - List all goals
- `GET /api/goals/{id}` - Get a specific goal
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

## Code Changes Summary

### Before (SQLAlchemy)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db

@app.get("/api/goals")
async def read_goals(db: AsyncSession = Depends(get_db)):
    goals = await crud.get_goals(db)
    return goals
```

### After (Supabase)
```python
from supabase import Client
from .supabase_client import get_supabase

@app.get("/api/goals")
async def read_goals(supabase: Client = Depends(get_supabase)):
    goals = await crud.get_goals(supabase)
    return goals
```

## Benefits of Supabase

1. **No Database Container**: No need to manage PostgreSQL Docker containers
2. **Built-in Features**: Auth, Storage, Realtime, Edge Functions included
3. **Auto-generated APIs**: REST and GraphQL APIs out of the box
4. **Row Level Security**: Database-level security policies
5. **Scalability**: Managed hosting with automatic backups
6. **Free Tier**: Generous free tier for development

## Troubleshooting

### Error: "Missing Supabase configuration"
- Make sure `.env` file exists with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Error: "relation 'goals' does not exist"
- Run the SQL schema creation script in your Supabase SQL Editor

### Error: "new row violates row-level security policy"
- Check your RLS policies in Supabase Dashboard → Authentication → Policies
- For testing, you can temporarily disable RLS or use the permissive policy shown above

### Connection timeout
- Verify your Supabase project is active (not paused)
- Check that you're using the correct URL and key
- Ensure your internet connection is working

## Next Steps

Consider adding these Supabase features:

1. **Authentication**: Add user signup/login
2. **Row Level Security**: Implement user-specific data access
3. **Real-time**: Subscribe to database changes
4. **Storage**: Add file uploads for goals
5. **Edge Functions**: Add serverless backend logic

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Python Client](https://supabase.com/docs/reference/python)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Local Development](https://supabase.com/docs/guides/local-development)
