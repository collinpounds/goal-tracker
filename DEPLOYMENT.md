# Cloud Run Deployment Guide

This guide will help you deploy the Goal Tracker app to Google Cloud Run.

## Prerequisites

- Google Cloud account
- Project ID: `goal-tracker-477205`
- gcloud CLI installed and authenticated
- Docker installed locally (optional, for local testing)

## Quick Deploy

Run the automated deployment script:

```bash
./deploy-cloudrun.sh
```

This will:
1. Build your Docker image using Google Cloud Build
2. Push to Google Container Registry
3. Deploy to Cloud Run with all environment variables configured

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### Step 1: Build and Push Docker Image

```bash
gcloud builds submit --tag gcr.io/goal-tracker-477205/goal-tracker \
  --project goal-tracker-477205 \
  -f Dockerfile.cloudrun .
```

This uses Cloud Build to:
- Build the frontend (Node.js)
- Build the backend (Python/FastAPI)
- Combine them into a single container
- Push to Google Container Registry

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy goal-tracker \
  --image gcr.io/goal-tracker-477205/goal-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=https://bnmdrvslwmuimlpkqqfq.supabase.co" \
  --set-env-vars "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubWRydnNsd211aW1scGtxcWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTg5MDEsImV4cCI6MjA3Nzc5NDkwMX0.4Sa_IlZ_KLetqlDPeHyYhueDWw72XqpPwZDoOERQjKg" \
  --project goal-tracker-477205
```

### Step 3: Get Your App URL

```bash
gcloud run services describe goal-tracker \
  --region us-central1 \
  --format 'value(status.url)'
```

## Using Google Cloud Console (Web UI)

If you prefer using the web interface:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run?project=goal-tracker-477205)

2. First, build the image:
   - Go to [Cloud Build](https://console.cloud.google.com/cloud-build)
   - Click "Submit Build"
   - Upload your source code or connect to repository
   - Use Dockerfile: `Dockerfile.cloudrun`

3. Deploy to Cloud Run:
   - Click **"CREATE SERVICE"**
   - Select **"Deploy one revision from an existing container image"**
   - Click **"SELECT"** → Choose `gcr.io/goal-tracker-477205/goal-tracker`
   - Service name: `goal-tracker`
   - Region: `us-central1` (or your preferred region)
   
4. Configure Container:
   - Click **"Container, Variables & Secrets, Connections, Security"**
   - Add environment variables:
     - `SUPABASE_URL` = `https://bnmdrvslwmuimlpkqqfq.supabase.co`
     - `SUPABASE_ANON_KEY` = `<your-anon-key>`
   
5. Authentication:
   - Select **"Allow unauthenticated invocations"**
   
6. Click **"CREATE"**

## Architecture

The deployment uses a unified container that includes:

- **Frontend**: React app built with Vite, served as static files
- **Backend**: FastAPI serving both the API and frontend
- **Database**: Supabase (external, configured via env vars)

### How it Works

```
Cloud Run Container
├── FastAPI (Port 8080)
│   ├── /api/* → API endpoints
│   ├── /assets/* → Static assets (JS, CSS)
│   └── /* → React SPA (index.html)
└── Connected to Supabase PostgreSQL
```

## Environment Variables

Required environment variables for Cloud Run:

| Variable | Value | Description |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://bnmdrvslwmuimlpkqqfq.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `<your-key>` | Supabase anonymous/public key |
| `PORT` | `8080` | Automatically set by Cloud Run |

## Testing the Deployment

Once deployed, test your endpoints:

```bash
# Get your Cloud Run URL
URL=$(gcloud run services describe goal-tracker --region us-central1 --format 'value(status.url)')

# Test health endpoint
curl $URL/health

# Test API
curl $URL/api/goals

# Open in browser
open $URL
```

## Updating the Deployment

To deploy updates:

```bash
# Make your changes, then:
./deploy-cloudrun.sh
```

Or manually:

```bash
# Rebuild and redeploy
gcloud builds submit --tag gcr.io/goal-tracker-477205/goal-tracker \
  --project goal-tracker-477205 \
  -f Dockerfile.cloudrun .

gcloud run services update goal-tracker \
  --image gcr.io/goal-tracker-477205/goal-tracker \
  --region us-central1 \
  --project goal-tracker-477205
```

## Monitoring and Logs

View logs:
```bash
gcloud run services logs read goal-tracker \
  --region us-central1 \
  --project goal-tracker-477205
```

Or visit: [Cloud Run Logs](https://console.cloud.google.com/run/detail/us-central1/goal-tracker/logs?project=goal-tracker-477205)

## Troubleshooting

### Build Fails

If the build fails, check:
1. Cloud Build API is enabled
2. Your project has billing enabled
3. Dockerfile.cloudrun exists in the root directory

Enable Cloud Build API:
```bash
gcloud services enable cloudbuild.googleapis.com --project goal-tracker-477205
```

### Deployment Fails

Common issues:
- **Port mismatch**: Cloud Run sets `PORT=8080`. Our app uses this automatically.
- **Environment variables**: Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- **Permissions**: Your service account needs proper permissions

### Application Errors

Check logs:
```bash
gcloud run services logs tail goal-tracker --region us-central1
```

## Cost Estimation

Cloud Run pricing (as of 2025):
- **Free tier**: 2 million requests/month
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

For a small app, expect ~$5-20/month depending on traffic.

## Security Recommendations

For production:

1. **Enable authentication** if needed:
   ```bash
   gcloud run services update goal-tracker \
     --no-allow-unauthenticated \
     --region us-central1
   ```

2. **Use Secret Manager** for sensitive data:
   ```bash
   # Store secret
   echo -n "your-api-key" | gcloud secrets create supabase-anon-key --data-file=-
   
   # Deploy with secret
   gcloud run deploy goal-tracker \
     --update-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest
   ```

3. **Set up custom domain**:
   - Go to Cloud Run service → "Manage Custom Domains"
   - Add your domain and follow DNS configuration steps

4. **Enable HTTPS only** (already default in Cloud Run)

## Rollback

To rollback to a previous version:

```bash
# List revisions
gcloud run revisions list --service goal-tracker --region us-central1

# Rollback to specific revision
gcloud run services update-traffic goal-tracker \
  --to-revisions REVISION-NAME=100 \
  --region us-central1
```

## GitHub Actions Deployment (Recommended)

The repository is configured with GitHub Actions for automatic deployment on push to `main`.

### Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GCP_SA_KEY` | Google Cloud Service Account JSON key | See [Creating Service Account](#creating-service-account) below |
| `SUPABASE_ACCESS_TOKEN` | Supabase Personal Access Token | Dashboard → Account → Access Tokens → Generate new token |
| `SUPABASE_DB_PASSWORD` | Supabase Database Password | Dashboard → Project Settings → Database → Password |

### Creating Service Account

1. Go to [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"CREATE SERVICE ACCOUNT"**
3. Name: `github-actions-deployer`
4. Grant roles:
   - **Cloud Run Admin** (roles/run.admin)
   - **Cloud Build Editor** (roles/cloudbuild.builds.editor)
   - **Storage Admin** (roles/storage.admin)
   - **Service Account User** (roles/iam.serviceAccountUser)
5. Click **"CREATE KEY"** → JSON format
6. Copy the entire JSON content and add it as `GCP_SA_KEY` secret in GitHub

### How It Works

On every push to `main` branch, the GitHub Action will:

1. **Run Database Migrations**: Apply any new migrations to production Supabase
2. **Build Docker Image**: Create production container with frontend and backend
3. **Deploy to Cloud Run**: Update the running service
4. **Health Check**: Verify deployment succeeded

View the workflow: `.github/workflows/deploy-cloudrun.yml`

### Manual Trigger

You can also manually trigger a deployment:

1. Go to GitHub repository → Actions tab
2. Select "Deploy to Cloud Run" workflow
3. Click "Run workflow"

## Continuous Deployment (Alternative)

For automated deployments using Cloud Build triggers:

1. Connect your GitHub/GitLab repository
2. Create a `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/goal-tracker', '-f', 'Dockerfile.cloudrun', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/goal-tracker']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'goal-tracker'
      - '--image'
      - 'gcr.io/$PROJECT_ID/goal-tracker'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

## Support

For issues:
- Check [Cloud Run Documentation](https://cloud.google.com/run/docs)
- View [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- Contact GCP Support
