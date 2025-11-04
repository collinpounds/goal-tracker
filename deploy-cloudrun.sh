#!/bin/bash
# Deploy Goal Tracker to Google Cloud Run

set -e

PROJECT_ID="goal-tracker-477205"
SERVICE_NAME="goal-tracker"
REGION="us-central1"

echo "================================================"
echo "Deploying Goal Tracker to Google Cloud Run"
echo "================================================"
echo ""
echo "Project ID: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo ""

# Use the cloudbuild.yaml config
echo "Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml --project ${PROJECT_ID}

echo ""
echo "================================================"
echo "✓ Deployment Complete!"
echo "================================================"
echo ""

# Get the URL
URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID} --format 'value(status.url)' 2>/dev/null || echo "")

if [ -n "$URL" ]; then
    echo "Your app is live at:"
    echo "$URL"
    echo ""
    echo "Test it with:"
    echo "  curl $URL/health"
else
    echo "Get your app URL with:"
    echo "  gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'"
fi
echo ""
