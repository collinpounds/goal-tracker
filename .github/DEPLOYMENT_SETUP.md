# GitHub Actions Deployment Setup

This guide explains how to set up automatic deployments to Google Cloud Run using GitHub Actions.

## Overview

The GitHub Action workflow automatically deploys your Goal Tracker app to Google Cloud Run whenever you push changes to the `main` branch that affect:
- Backend code (`backend/**`)
- Frontend code (`frontend/**`)
- Docker configuration (`Dockerfile.cloudrun`)
- Build configuration (`cloudbuild.yaml`)
- The workflow itself

## Prerequisites

1. Google Cloud Project with Cloud Run enabled
2. GitHub repository for this project
3. Service account with proper permissions

## Setup Steps

### Step 1: Create a Google Cloud Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `goal-tracker-477205`
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Fill in details:
   - **Name:** `github-actions-deployer`
   - **Description:** `Service account for GitHub Actions to deploy to Cloud Run`
6. Click **Create and Continue**

### Step 2: Grant Required Roles

Add the following roles to the service account:

- **Cloud Run Admin** (`roles/run.admin`)
  - Allows deploying and managing Cloud Run services
- **Service Account User** (`roles/iam.serviceAccountUser`)
  - Allows the service account to act as other service accounts
- **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
  - Allows creating and managing Cloud Build jobs
- **Storage Admin** (`roles/storage.admin`)
  - Allows pushing images to Container Registry

Click **Done** when finished.

### Step 3: Create and Download Service Account Key

1. In the Service Accounts list, find `github-actions-deployer`
2. Click the three dots menu (⋮) > **Manage Keys**
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. The JSON key file will be downloaded automatically
7. **IMPORTANT:** Keep this file secure and never commit it to your repository

### Step 4: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Create the following secret:
   - **Name:** `GCP_SA_KEY`
   - **Value:** Paste the entire contents of the JSON key file you downloaded
5. Click **Add secret**

### Step 5: Enable Required Google Cloud APIs

Run these commands in your terminal (or use the Cloud Console):

```bash
# Set your project
gcloud config set project goal-tracker-477205

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 6: Verify Workflow File

The workflow file is located at [`.github/workflows/deploy-cloudrun.yml`](../.github/workflows/deploy-cloudrun.yml).

It contains:
- **Trigger:** Runs on push to `main` branch
- **Environment variables:** Project ID, service name, region
- **Steps:** Checkout, authenticate, build, deploy, test

### Step 7: Test the Deployment

1. Make a change to your code
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push origin main
   ```
3. Go to your GitHub repository > **Actions** tab
4. Watch the deployment workflow run
5. Once complete, check the deployment summary for the service URL

## Workflow Details

### Trigger Conditions

The workflow runs when you push to `main` and changes affect:
- `backend/**` - Backend Python code
- `frontend/**` - Frontend React code
- `Dockerfile.cloudrun` - Docker build configuration
- `cloudbuild.yaml` - Cloud Build configuration
- `.github/workflows/deploy-cloudrun.yml` - Workflow file itself

### Environment Variables

Configured in the workflow:
- `PROJECT_ID`: `goal-tracker-477205`
- `SERVICE_NAME`: `goal-tracker`
- `REGION`: `us-central1`

### Steps Performed

1. **Checkout code** - Gets the latest code from the repository
2. **Authenticate to Google Cloud** - Uses the service account key
3. **Set up Cloud SDK** - Configures gcloud CLI
4. **Configure Docker** - Sets up Docker authentication for GCR
5. **Build and deploy** - Runs Cloud Build with your `cloudbuild.yaml`
6. **Get service URL** - Retrieves the deployed Cloud Run URL
7. **Test deployment** - Runs a health check to verify the deployment
8. **Deployment summary** - Outputs deployment details in GitHub Actions UI

## Troubleshooting

### Authentication Errors

**Error:** `ERROR: (gcloud.auth.activate-service-account) Could not read json file`

**Solution:**
- Verify the `GCP_SA_KEY` secret contains valid JSON
- Make sure you copied the entire JSON file contents
- Check there are no extra spaces or characters

### Permission Errors

**Error:** `User does not have permission to access project`

**Solution:**
- Verify the service account has all required roles (see Step 2)
- Wait a few minutes for permissions to propagate
- Make sure you're using the correct project ID

### Build Failures

**Error:** `ERROR: build step failed`

**Solution:**
- Check the Cloud Build logs in GitHub Actions output
- Verify `Dockerfile.cloudrun` and `cloudbuild.yaml` exist
- Ensure all APIs are enabled (see Step 5)

### Deployment Failures

**Error:** `ERROR: (gcloud.run.deploy) PERMISSION_DENIED`

**Solution:**
- Service account needs `Cloud Run Admin` role
- Check the service account has `Service Account User` role

### Health Check Failures

**Error:** `curl: (22) The requested URL returned error: 404`

**Solution:**
- Check that your backend has a `/health` endpoint
- Verify the Cloud Run service is actually running
- Check logs in Cloud Run console

## Security Best Practices

1. **Never commit the service account JSON key** to your repository
2. **Use GitHub Secrets** for all sensitive data
3. **Limit service account permissions** to only what's needed
4. **Rotate keys regularly** (every 90 days recommended)
5. **Use different service accounts** for different environments (dev/staging/prod)

## Advanced Configuration

### Deploy to Multiple Environments

To deploy to different environments (dev, staging, prod):

1. Create separate workflows for each environment:
   - `.github/workflows/deploy-dev.yml`
   - `.github/workflows/deploy-staging.yml`
   - `.github/workflows/deploy-prod.yml`

2. Use different branches as triggers:
   ```yaml
   on:
     push:
       branches:
         - develop  # for dev
         - staging  # for staging
         - main     # for prod
   ```

3. Create separate service accounts and secrets for each environment

### Use Secret Manager for Environment Variables

Instead of hardcoding environment variables in `cloudbuild.yaml`, use Google Secret Manager:

1. Create secrets in Secret Manager:
   ```bash
   echo -n "https://bnmdrvslwmuimlpkqqfq.supabase.co" | \
     gcloud secrets create supabase-url --data-file=-

   echo -n "your-anon-key" | \
     gcloud secrets create supabase-anon-key --data-file=-
   ```

2. Grant service account access:
   ```bash
   gcloud secrets add-iam-policy-binding supabase-url \
     --member="serviceAccount:github-actions-deployer@goal-tracker-477205.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Update Cloud Run deployment to use secrets:
   ```yaml
   - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
     entrypoint: gcloud
     args:
       - 'run'
       - 'deploy'
       - 'goal-tracker'
       - '--update-secrets'
       - 'SUPABASE_URL=supabase-url:latest'
       - '--update-secrets'
       - 'SUPABASE_ANON_KEY=supabase-anon-key:latest'
   ```

### Add Slack/Discord Notifications

Add a notification step to your workflow:

```yaml
- name: Notify deployment
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to Cloud Run ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Manual Approval

For production deployments, add manual approval:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: ${{ steps.get-url.outputs.url }}
```

Then configure the environment in GitHub Settings > Environments > production > Add protection rule.

## Monitoring Deployments

### View Deployment History

- **GitHub Actions:** Repository > Actions tab
- **Cloud Run:** [Cloud Run Console](https://console.cloud.google.com/run?project=goal-tracker-477205)
- **Cloud Build:** [Cloud Build History](https://console.cloud.google.com/cloud-build/builds?project=goal-tracker-477205)

### View Logs

```bash
# GitHub Actions logs - available in the Actions tab on GitHub

# Cloud Run logs
gcloud run services logs read goal-tracker \
  --region us-central1 \
  --project goal-tracker-477205 \
  --limit 50

# Cloud Build logs
gcloud builds list --project goal-tracker-477205 --limit 10
```

### Set Up Alerts

Create alerts in Google Cloud Monitoring for:
- Deployment failures
- High error rates
- Increased latency
- Cost thresholds

## Rollback Procedure

If a deployment fails or causes issues:

### Option 1: Revert the Git Commit

```bash
git revert HEAD
git push origin main
```

This will trigger a new deployment with the previous code.

### Option 2: Manual Rollback in Cloud Run

```bash
# List revisions
gcloud run revisions list \
  --service goal-tracker \
  --region us-central1 \
  --project goal-tracker-477205

# Rollback to previous revision
gcloud run services update-traffic goal-tracker \
  --to-revisions REVISION-NAME=100 \
  --region us-central1 \
  --project goal-tracker-477205
```

### Option 3: Re-run Previous Successful Workflow

1. Go to GitHub repository > Actions tab
2. Find the last successful deployment workflow
3. Click **Re-run jobs** > **Re-run all jobs**

## Cost Considerations

GitHub Actions:
- **Free tier:** 2,000 minutes/month for private repos
- This workflow uses ~5-10 minutes per deployment
- Estimate: ~200-400 deployments per month within free tier

Google Cloud:
- Cloud Build: Free tier includes 120 build-minutes/day
- Cloud Run: See [DEPLOYMENT.md](../DEPLOYMENT.md) for pricing details
- Container Registry: Storage costs for Docker images (~$0.026/GB/month)

## Support and Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Troubleshooting Cloud Run](https://cloud.google.com/run/docs/troubleshooting)

## Next Steps

After setting up automated deployments:

1. Consider adding automated testing before deployment
2. Set up staging environment for testing before production
3. Configure monitoring and alerting
4. Set up custom domain for your Cloud Run service
5. Implement proper secret management with Secret Manager
