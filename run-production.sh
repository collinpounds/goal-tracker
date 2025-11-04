#!/bin/bash
# Run app with production Supabase

echo "🚀 Starting Goal Tracker in PRODUCTION mode..."
echo ""
echo "Using production environment (.env.production)"
cp .env.production .env

echo "Starting Docker containers..."
docker-compose down > /dev/null 2>&1
docker-compose up -d

echo ""
echo "================================================"
echo "✓ Goal Tracker running in PRODUCTION mode"
echo "================================================"
echo "Frontend:         http://localhost"
echo "Backend API:      http://localhost:8000"
echo "API Docs:         http://localhost:8000/docs"
echo "Supabase:         https://bnmdrvslwmuimlpkqqfq.supabase.co"
echo "================================================"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
