#!/bin/bash

# Database Migration Helper Script
# Usage: ./migrate.sh [command]

COMMAND=${1:-upgrade}

case $COMMAND in
    upgrade)
        echo "🔄 Running database migrations..."
        alembic upgrade head
        ;;
    downgrade)
        echo "⏪ Rolling back last migration..."
        alembic downgrade -1
        ;;
    current)
        echo "📍 Current migration version:"
        alembic current
        ;;
    history)
        echo "📜 Migration history:"
        alembic history --verbose
        ;;
    create)
        if [ -z "$2" ]; then
            echo "❌ Error: Please provide a migration name"
            echo "Usage: ./migrate.sh create 'migration_name'"
            exit 1
        fi
        echo "📝 Creating new migration: $2"
        alembic revision --autogenerate -m "$2"
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
        echo "Usage: ./migrate.sh [command]"
        echo ""
        echo "Commands:"
        echo "  upgrade    - Run all pending migrations (default)"
        echo "  downgrade  - Roll back the last migration"
        echo "  current    - Show current migration version"
        echo "  history    - Show migration history"
        echo "  create     - Create a new migration"
        echo "  reset      - Reset database (downgrade all, then upgrade all)"
        exit 1
        ;;
esac
