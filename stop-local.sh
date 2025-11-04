#!/bin/bash
# Stop local development environment

echo "================================================"
echo "Stopping Local Development Environment"
echo "================================================"
echo ""

# Stop Docker Compose services if running
if docker-compose ps | grep -q "Up"; then
    echo "Stopping Docker Compose services..."
    docker-compose down
    echo "✓ Docker Compose services stopped"
    echo ""
fi

# Stop Supabase (keeps data)
echo "Stopping Supabase services (data will be preserved)..."
./bin/supabase stop

echo ""
echo "================================================"
echo "✓ All services stopped"
echo "================================================"
echo ""
echo "To start again, run:"
echo "  ./start-local.sh"
echo ""
echo "To reset all data, run:"
echo "  ./bin/supabase stop --no-backup"
echo "================================================"
