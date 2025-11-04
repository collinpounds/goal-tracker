# Quick Deployment to Cloud Run

## Run These Commands in Your Terminal

Open a terminal where you have `gcloud` installed and run:

### Step 1: Build and Push Image

```bash
cd /Users/collinpounds/dev/goal_tracker

gcloud builds submit \
  --tag gcr.io/goal-tracker-477205/goal-tracker \
  --project goal-tracker-477205 \
  -f Dockerfile.cloudrun .
```

This will take 3-5 minutes to build both frontend and backend.

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

When prompted "Allow unauthenticated invocations?" → Answer **Y** (yes)

### Step 3: Get Your URL

After deployment completes, you'll see a Service URL like:
```
https://goal-tracker-XXXXXXXXXX-uc.a.run.app
```

Or retrieve it with:
```bash
gcloud run services describe goal-tracker \
  --region us-central1 \
  --format 'value(status.url)'
```

### Step 4: Test Your Deployment

```bash
# Get the URL
URL=$(gcloud run services describe goal-tracker --region us-central1 --format 'value(status.url)')

# Test health endpoint
curl $URL/health

# Test API
curl $URL/api/goals

# Open in browser
open $URL
```

## What Gets Deployed

Your unified container includes:
- React frontend (served from FastAPI)
- FastAPI backend with all API endpoints
- Connection to your Supabase database

## After Deployment

Your app will be live at the Cloud Run URL!

- Frontend: `https://your-url.run.app/`
- API Health: `https://your-url.run.app/health`
- Goals API: `https://your-url.run.app/api/goals`
- API Docs: `https://your-url.run.app/docs`

## Troubleshooting

If the build fails:
1. Make sure Cloud Build API is enabled
2. Check billing is enabled on your project
3. Verify you're in the correct directory

Enable Cloud Build:
```bash
gcloud services enable cloudbuild.googleapis.com --project goal-tracker-477205
```

If deployment fails, check logs:
```bash
gcloud run services logs read goal-tracker --region us-central1
```

## Files Created for Deployment

- `Dockerfile.cloudrun` - Multi-stage build for Cloud Run
- `deploy-cloudrun.sh` - Automated deployment script
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `QUICK_DEPLOY.md` - This file
