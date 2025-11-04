#!/bin/bash

# Database Migration Wrapper
# Runs migrations inside the backend container or locally

ENV=${1:-local}
COMMAND=${2:-upgrade}

if [ "$ENV" != "local" ] && [ "$ENV" != "production" ]; then
    echo "❌ Error: Environment must be 'local' or 'production'"
    echo "Usage: ./migrate.sh [local|production] [upgrade|downgrade|current|history|create|reset]"
    exit 1
fi

echo "🔧 Running migrations for $ENV environment..."

# Copy the appropriate .env file
cp .env.$ENV .env

# Check if running in Docker
if docker ps | grep -q goal_tracker_backend; then
    echo "🐳 Running migrations in Docker container..."
    docker exec -it goal_tracker_backend bash -c "cd /app && alembic $COMMAND head"
else
    echo "💻 Running migrations locally..."
    cd backend
    case $COMMAND in
        upgrade)
            alembic upgrade head
            ;;
        downgrade)
            alembic downgrade -1
            ;;
        current)
            alembic current
            ;;
        history)
            alembic history --verbose
            ;;
        create)
            if [ -z "$3" ]; then
                echo "❌ Error: Please provide a migration name"
                echo "Usage: ./migrate.sh $ENV create 'migration_name'"
                exit 1
            fi
            alembic revision --autogenerate -m "$3"
            ;;
        reset)
            echo "⚠️  WARNING: This will reset the database!"
            read -p "Are you sure? (yes/no): " -r
            if [[ $REPLY == "yes" ]]; then
                alembic downgrade base
                alembic upgrade head
                echo "✅ Database reset complete"
            else
                echo "❌ Reset cancelled"
            fi
            ;;
        *)
            alembic $COMMAND
            ;;
    esac
fi
