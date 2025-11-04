#!/bin/bash

# Goal Tracker - Run Script
# Usage: ./run.sh [local|production] [up|down|build]

ENV=${1:-local}
COMMAND=${2:-up}

if [ "$ENV" != "local" ] && [ "$ENV" != "production" ]; then
    echo "❌ Error: Environment must be 'local' or 'production'"
    echo "Usage: ./run.sh [local|production] [up|down|build]"
    echo ""
    echo "Examples:"
    echo "  ./run.sh local up          # Run with local database"
    echo "  ./run.sh production up     # Run with Supabase"
    echo "  ./run.sh local down        # Stop local environment"
    echo "  ./run.sh production build  # Rebuild production containers"
    exit 1
fi

# Copy the appropriate .env file
echo "🔧 Using $ENV environment..."
cp .env.$ENV .env

if [ "$ENV" = "local" ]; then
    echo "🐘 Starting with local PostgreSQL database"
    if [ "$COMMAND" = "up" ]; then
        docker-compose --profile local up --build
    elif [ "$COMMAND" = "down" ]; then
        docker-compose --profile local down
    elif [ "$COMMAND" = "build" ]; then
        docker-compose --profile local build
    else
        docker-compose --profile local $COMMAND
    fi
else
    echo "☁️  Starting with Supabase database"
    if [ "$COMMAND" = "up" ]; then
        docker-compose up backend frontend --build
    elif [ "$COMMAND" = "down" ]; then
        docker-compose down
    elif [ "$COMMAND" = "build" ]; then
        docker-compose build backend frontend
    else
        docker-compose $COMMAND backend frontend
    fi
fi
