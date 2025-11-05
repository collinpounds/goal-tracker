#!/bin/bash
# Generate version information for the application

# Get the short commit SHA
COMMIT_SHA=${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "dev")}
SHORT_SHA=$(echo $COMMIT_SHA | cut -c1-7)

# Get the current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Get the branch name
BRANCH=${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo "unknown")}

# Get the build number (from GitHub Actions or default to 0)
BUILD_NUMBER=${GITHUB_RUN_NUMBER:-0}

# Create version string: v{build-number}-{short-sha}
VERSION="v${BUILD_NUMBER}-${SHORT_SHA}"

# Create the version info JSON file for the frontend
cat > frontend/public/version.json << EOF
{
  "version": "${VERSION}",
  "commit": "${SHORT_SHA}",
  "branch": "${BRANCH}",
  "timestamp": "${TIMESTAMP}",
  "buildNumber": ${BUILD_NUMBER}
}
EOF

echo "Generated version: ${VERSION}"
echo "Commit: ${SHORT_SHA}"
echo "Branch: ${BRANCH}"
echo "Build: ${BUILD_NUMBER}"
echo "Timestamp: ${TIMESTAMP}"
