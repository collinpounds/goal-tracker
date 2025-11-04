#!/bin/bash
# Run app with local Supabase

echo "🏠 Starting Goal Tracker in LOCAL mode..."
echo ""

# Make sure local Supabase is running
if ! ./bin/supabase status > /dev/null 2>&1; then
    echo "Starting local Supabase..."
    ./bin/supabase start
else
    echo "✓ Local Supabase is running"
fi

echo ""
echo "Using local environment (.env.local)"
cp .env.local .env

echo "Starting Docker containers..."
docker-compose down > /dev/null 2>&1
docker-compose up -d

echo ""
echo "================================================"
echo "✓ Goal Tracker running in LOCAL mode"
echo "================================================"
echo "Frontend:         http://localhost"
echo "Backend API:      http://localhost:8000"
echo "API Docs:         http://localhost:8000/docs"
echo "Supabase Studio:  http://localhost:54323"
echo "================================================"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
