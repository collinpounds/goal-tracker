#!/bin/bash

# Integration Test Runner for Goal Tracker
# Runs tests with visual checkmarks for Docker builds

set -e

echo "======================================================================"
echo "GOAL TRACKER - INTEGRATION TEST SUITE"
echo "======================================================================"
echo ""

# Check if server is running
echo "🔍 Checking if API server is accessible..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ API server is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ API server not accessible after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for API server... (attempt $attempt/$max_attempts)"
    sleep 2
done

echo ""
echo "======================================================================"
echo "RUNNING INTEGRATION TESTS"
echo "======================================================================"
echo ""

# Run the integration tests
python -m pytest /app/tests/test_integration.py -v -s --tb=short

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "======================================================================"
    echo "✅ ALL INTEGRATION TESTS PASSED"
    echo "======================================================================"
else
    echo "======================================================================"
    echo "❌ SOME TESTS FAILED"
    echo "======================================================================"
fi
echo ""

exit $TEST_EXIT_CODE
