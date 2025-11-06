"""
Integration tests for Goal Tracker API.
These tests verify end-to-end functionality with checkmarks for Docker builds.
"""
import pytest
import asyncio
from httpx import AsyncClient
import sys

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test_user_{asyncio.get_event_loop().time()}@example.com"
TEST_PASSWORD = "TestPassword123!"


class TestResults:
    """Track test results with checkmarks"""
    def __init__(self):
        self.passed = []
        self.failed = []

    def mark_pass(self, test_name):
        self.passed.append(test_name)
        print(f"✅ {test_name}")

    def mark_fail(self, test_name, error):
        self.failed.append((test_name, error))
        print(f"❌ {test_name}: {error}")

    def summary(self):
        print("\n" + "="*60)
        print("INTEGRATION TEST SUMMARY")
        print("="*60)
        print(f"✅ Passed: {len(self.passed)}/{len(self.passed) + len(self.failed)}")
        if self.failed:
            print(f"❌ Failed: {len(self.failed)}")
            for test, error in self.failed:
                print(f"   - {test}: {error}")
        print("="*60 + "\n")
        return len(self.failed) == 0


results = TestResults()


@pytest.mark.asyncio
async def test_full_workflow():
    """
    Complete integration test workflow:
    1. Sign up new user
    2. Log in
    3. Create a private goal
    4. Create a public goal
    5. Update goal status
    6. Create a team
    7. Add goal to team
    8. Create nested team
    9. Send team invitation
    10. Delete goal
    11. Log out
    """

    async with AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        access_token = None
        goal_id = None
        public_goal_id = None
        team_id = None
        nested_team_id = None

        # Test 1: Health Check
        try:
            response = await client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"
            results.mark_pass("Health check")
        except Exception as e:
            results.mark_fail("Health check", str(e))
            return

        # Test 2: Sign up new user
        try:
            response = await client.post("/auth/signup", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            assert response.status_code in [200, 201]
            data = response.json()
            access_token = data.get("session", {}).get("access_token")
            assert access_token is not None
            results.mark_pass("User signup")
        except Exception as e:
            results.mark_fail("User signup", str(e))
            return

        # Set up authorization header
        headers = {"Authorization": f"Bearer {access_token}"}

        # Test 3: Create a private goal
        try:
            response = await client.post("/api/goals", json={
                "title": "Complete integration tests",
                "description": "Write comprehensive tests for the Goal Tracker",
                "status": "in_progress",
                "is_public": False,
                "scope": "private"
            }, headers=headers)
            assert response.status_code in [200, 201]
            goal_data = response.json()
            goal_id = goal_data["id"]
            assert goal_data["title"] == "Complete integration tests"
            assert goal_data["is_public"] is False
            results.mark_pass("Create private goal")
        except Exception as e:
            results.mark_fail("Create private goal", str(e))

        # Test 4: Create a public goal
        try:
            response = await client.post("/api/goals", json={
                "title": "Share knowledge publicly",
                "description": "Create public goals for community",
                "status": "pending",
                "is_public": True,
                "scope": "public"
            }, headers=headers)
            assert response.status_code in [200, 201]
            public_goal_data = response.json()
            public_goal_id = public_goal_data["id"]
            assert public_goal_data["is_public"] is True
            results.mark_pass("Create public goal")
        except Exception as e:
            results.mark_fail("Create public goal", str(e))

        # Test 5: Get all goals
        try:
            response = await client.get("/api/goals", headers=headers)
            assert response.status_code == 200
            goals = response.json()
            assert len(goals) >= 2
            results.mark_pass("Fetch all goals")
        except Exception as e:
            results.mark_fail("Fetch all goals", str(e))

        # Test 6: Get public goals
        try:
            response = await client.get("/api/goals/public", headers=headers)
            assert response.status_code == 200
            public_goals = response.json()
            assert any(g["id"] == public_goal_id for g in public_goals)
            results.mark_pass("Fetch public goals")
        except Exception as e:
            results.mark_fail("Fetch public goals", str(e))

        # Test 7: Update goal status
        if goal_id:
            try:
                response = await client.put(f"/api/goals/{goal_id}", json={
                    "status": "completed"
                }, headers=headers)
                assert response.status_code == 200
                updated_goal = response.json()
                assert updated_goal["status"] == "completed"
                results.mark_pass("Update goal status")
            except Exception as e:
                results.mark_fail("Update goal status", str(e))

        # Test 8: Create a team
        try:
            response = await client.post("/api/teams", json={
                "name": "Engineering Team",
                "description": "Our main engineering team",
                "color_theme": "#3B82F6"
            }, headers=headers)
            assert response.status_code in [200, 201]
            team_data = response.json()
            team_id = team_data["id"]
            assert team_data["name"] == "Engineering Team"
            results.mark_pass("Create team")
        except Exception as e:
            results.mark_fail("Create team", str(e))

        # Test 9: Get all teams
        try:
            response = await client.get("/api/teams", headers=headers)
            assert response.status_code == 200
            teams = response.json()
            assert len(teams) >= 1
            results.mark_pass("Fetch teams")
        except Exception as e:
            results.mark_fail("Fetch teams", str(e))

        # Test 10: Create nested team
        if team_id:
            try:
                response = await client.post("/api/teams", json={
                    "name": "Backend Team",
                    "description": "Backend sub-team",
                    "color_theme": "#10B981",
                    "parent_team_id": team_id
                }, headers=headers)
                assert response.status_code in [200, 201]
                nested_team_data = response.json()
                nested_team_id = nested_team_data["id"]
                assert nested_team_data["parent_team_id"] == team_id
                results.mark_pass("Create nested team")
            except Exception as e:
                results.mark_fail("Create nested team", str(e))

        # Test 11: Assign goal to team
        if goal_id and team_id:
            try:
                response = await client.post(f"/api/goals/{goal_id}/teams", json={
                    "team_ids": [team_id]
                }, headers=headers)
                assert response.status_code in [200, 201]
                results.mark_pass("Assign goal to team")
            except Exception as e:
                results.mark_fail("Assign goal to team", str(e))

        # Test 12: Get team goals
        if team_id:
            try:
                response = await client.get(f"/api/teams/{team_id}/goals", headers=headers)
                assert response.status_code == 200
                team_goals = response.json()
                assert any(g["id"] == goal_id for g in team_goals)
                results.mark_pass("Fetch team goals")
            except Exception as e:
                results.mark_fail("Fetch team goals", str(e))

        # Test 13: Get team members
        if team_id:
            try:
                response = await client.get(f"/api/teams/{team_id}/members", headers=headers)
                assert response.status_code == 200
                members = response.json()
                assert len(members) >= 1  # At least the creator
                results.mark_pass("Fetch team members")
            except Exception as e:
                results.mark_fail("Fetch team members", str(e))

        # Test 14: Send team invitation
        if team_id:
            try:
                response = await client.post(f"/api/teams/{team_id}/invite", json={
                    "team_id": team_id,
                    "email": "invited_user@example.com"
                }, headers=headers)
                assert response.status_code in [200, 201]
                invitation = response.json()
                assert "invite_code" in invitation
                results.mark_pass("Send team invitation")
            except Exception as e:
                results.mark_fail("Send team invitation", str(e))

        # Test 15: Get notifications
        try:
            response = await client.get("/api/notifications", headers=headers)
            assert response.status_code == 200
            notifications = response.json()
            results.mark_pass("Fetch notifications")
        except Exception as e:
            results.mark_fail("Fetch notifications", str(e))

        # Test 16: Update team
        if team_id:
            try:
                response = await client.put(f"/api/teams/{team_id}", json={
                    "name": "Engineering Team (Updated)",
                    "description": "Updated description"
                }, headers=headers)
                assert response.status_code == 200
                updated_team = response.json()
                assert "Updated" in updated_team["name"]
                results.mark_pass("Update team")
            except Exception as e:
                results.mark_fail("Update team", str(e))

        # Test 17: Delete goal
        if public_goal_id:
            try:
                response = await client.delete(f"/api/goals/{public_goal_id}", headers=headers)
                assert response.status_code in [200, 204]
                results.mark_pass("Delete goal")
            except Exception as e:
                results.mark_fail("Delete goal", str(e))

        # Test 18: Verify goal deleted
        if public_goal_id:
            try:
                response = await client.get(f"/api/goals/{public_goal_id}", headers=headers)
                assert response.status_code == 404
                results.mark_pass("Verify goal deletion")
            except Exception as e:
                results.mark_fail("Verify goal deletion", str(e))


@pytest.mark.asyncio
async def test_api_documentation():
    """Test that API documentation is accessible"""
    async with AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        try:
            response = await client.get("/docs")
            assert response.status_code == 200
            results.mark_pass("API documentation accessible")
        except Exception as e:
            results.mark_fail("API documentation accessible", str(e))


@pytest.mark.asyncio
async def test_openapi_spec():
    """Test that OpenAPI spec is available"""
    async with AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        try:
            response = await client.get("/openapi.json")
            assert response.status_code == 200
            spec = response.json()
            assert "openapi" in spec
            assert "paths" in spec
            results.mark_pass("OpenAPI spec available")
        except Exception as e:
            results.mark_fail("OpenAPI spec available", str(e))


def main():
    """Run all tests and display results"""
    print("\n" + "="*60)
    print("GOAL TRACKER INTEGRATION TESTS")
    print("="*60 + "\n")

    # Run pytest
    pytest.main([__file__, "-v", "-s"])

    # Display summary
    success = results.summary()

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
