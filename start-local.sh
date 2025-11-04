#!/bin/bash
# Start local development environment with Supabase

set -e

echo "================================================"
echo "Goal Tracker - Local Development Startup"
echo "================================================"
echo ""

# Check if Supabase is running
if ! ./bin/supabase status > /dev/null 2>&1; then
    echo "Starting local Supabase services..."
    ./bin/supabase start
    echo ""
else
    echo "✓ Supabase is already running"
    echo ""
fi

# Show Supabase status
echo "Supabase Services:"
./bin/supabase status

echo ""
echo "================================================"
echo "Local Development URLs:"
echo "================================================"
echo "Supabase Studio:  http://localhost:54323"
echo "API Gateway:      http://localhost:54321"
echo "PostgreSQL:       localhost:54322"
echo ""
echo "Backend API:      http://localhost:8000"
echo "Frontend:         http://localhost:80"
echo ""
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo "1. Install Python dependencies:"
echo "   cd backend && pip install -r requirements.txt"
echo ""
echo "2. Start the backend (in another terminal):"
echo "   cd backend && uvicorn app.main:app --reload"
echo ""
echo "3. Or use Docker Compose:"
echo "   docker-compose up --build"
echo ""
echo "4. Test the connection:"
echo "   python3 test_supabase_sdk.py"
echo "================================================"
