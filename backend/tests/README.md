# Goal Tracker Integration Tests

Comprehensive integration tests with visual checkmarks for easy verification during Docker builds.

## Test Coverage

The integration test suite covers:

✅ Health check endpoint
✅ User signup
✅ User authentication
✅ Create private goal
✅ Create public goal
✅ Fetch all goals
✅ Fetch public goals
✅ Update goal status
✅ Create team
✅ Fetch teams
✅ Create nested team (sub-team)
✅ Assign goal to team
✅ Fetch team goals
✅ Fetch team members
✅ Send team invitation
✅ Fetch notifications
✅ Update team
✅ Delete goal
✅ Verify goal deletion
✅ API documentation accessible
✅ OpenAPI spec available

## Running Tests Locally

### Option 1: Using Docker Compose

```bash
# Start the services
docker-compose up -d

# Run the integration tests
docker-compose exec backend /app/tests/run_tests.sh
```

### Option 2: Direct pytest

```bash
# Make sure the backend is running
cd backend
python -m pytest tests/test_integration.py -v -s
```

### Option 3: Using the test script

```bash
cd backend/tests
./run_tests.sh
```

## Running Tests in CI/CD

Add this to your GitHub Actions or deployment pipeline:

```yaml
- name: Run Integration Tests
  run: |
    docker-compose up -d
    docker-compose exec -T backend /app/tests/run_tests.sh
```

## Test Output Example

```
======================================================================
GOAL TRACKER - INTEGRATION TEST SUITE
======================================================================

🔍 Checking if API server is accessible...
✅ API server is ready

======================================================================
RUNNING INTEGRATION TESTS
======================================================================

✅ Health check
✅ User signup
✅ Create private goal
✅ Create public goal
✅ Fetch all goals
✅ Fetch public goals
✅ Update goal status
✅ Create team
✅ Fetch teams
✅ Create nested team
✅ Assign goal to team
✅ Fetch team goals
✅ Fetch team members
✅ Send team invitation
✅ Fetch notifications
✅ Update team
✅ Delete goal
✅ Verify goal deletion
✅ API documentation accessible
✅ OpenAPI spec available

======================================================================
INTEGRATION TEST SUMMARY
======================================================================
✅ Passed: 20/20
======================================================================

======================================================================
✅ ALL INTEGRATION TESTS PASSED
======================================================================
```

## Test Configuration

The tests use:
- **Base URL:** `http://localhost:8000`
- **Test user:** Generated with timestamp to avoid conflicts
- **Timeout:** 30 seconds for HTTP requests
- **Wait time:** Up to 60 seconds for server startup

## Adding New Tests

To add new test scenarios:

1. Add a new test function to `test_integration.py`
2. Use the `results.mark_pass()` and `results.mark_fail()` methods
3. Follow the async pattern with `httpx.AsyncClient`
4. Update this README with the new test case

Example:

```python
# Test X: Your new test
try:
    response = await client.get("/api/your-endpoint", headers=headers)
    assert response.status_code == 200
    results.mark_pass("Your test description")
except Exception as e:
    results.mark_fail("Your test description", str(e))
```

## Dependencies

Tests require:
- `pytest>=7.4.3`
- `pytest-asyncio>=0.21.1`
- `httpx>=0.25.2`

These are included in `requirements.txt`.

## Troubleshooting

### Tests fail with "API server not accessible"

- Ensure the backend service is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify the health endpoint manually: `curl http://localhost:8000/health`

### Tests fail with authentication errors

- Check Supabase configuration in `.env`
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Ensure the database migrations have been applied

### Tests timeout

- Increase the timeout in `test_integration.py` (default: 30 seconds)
- Check if the database is responding slowly
- Verify network connectivity to Supabase

## Continuous Integration

These tests are designed to run automatically in CI/CD pipelines. The checkmark output makes it easy to quickly verify which features are working in build logs.

For GitHub Actions, the workflow will show:
- Green checkmarks (✅) for passing tests
- Red X marks (❌) for failures
- A summary with pass/fail counts

## Future Enhancements

Planned test additions:
- Frontend E2E tests with Playwright
- Load testing with Locust
- API performance benchmarks
- Security scanning
- Database migration tests
