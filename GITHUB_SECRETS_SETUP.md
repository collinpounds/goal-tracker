# GitHub Secrets Setup Guide

This guide will help you configure the required secrets for automatic deployment via GitHub Actions.

## Prerequisites

- Admin access to the GitHub repository
- Access to your Supabase dashboard
- Access to your Google Cloud project

## Step-by-Step Setup

### 1. Navigate to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each secret below

---

### 2. Add GCP_SA_KEY (Google Cloud Service Account)

This allows GitHub Actions to deploy to Cloud Run.

**Steps:**

1. Go to [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=goal-tracker-477205)

2. Click **"CREATE SERVICE ACCOUNT"**
   - Name: `github-actions-deployer`
   - Description: `Service account for GitHub Actions deployments`
   - Click **"CREATE AND CONTINUE"**

3. **Grant these roles** (click "Add Another Role" for each):
   - `Cloud Run Admin` (roles/run.admin)
   - `Cloud Build Editor` (roles/cloudbuild.builds.editor)
   - `Storage Admin` (roles/storage.admin)
   - `Service Account User` (roles/iam.serviceAccountUser)
   - Click **"CONTINUE"** then **"DONE"**

4. **Create a JSON key**:
   - Find your new service account in the list
   - Click the three dots (⋮) → **"Manage keys"**
   - Click **"ADD KEY"** → **"Create new key"**
   - Select **JSON** format
   - Click **"CREATE"** (downloads a JSON file)

5. **Add to GitHub**:
   - Open the downloaded JSON file in a text editor
   - Copy the entire contents
   - In GitHub: New secret → Name: `GCP_SA_KEY`
   - Paste the JSON content
   - Click **"Add secret"**

---

### 3. Add SUPABASE_ACCESS_TOKEN

This allows the GitHub Action to run database migrations.

**Steps:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)

2. Click your **profile icon** (top right) → **Account**

3. Scroll down to **"Access Tokens"** section

4. Click **"Generate new token"**
   - Name: `GitHub Actions Migrations`
   - Click **"Generate token"**
   - **⚠️ COPY THE TOKEN IMMEDIATELY** (it won't be shown again)

5. **Add to GitHub**:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: Paste the token you just copied
   - Click **"Add secret"**

---

### 4. Add SUPABASE_DB_PASSWORD

This is your Supabase database password.

**Steps:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)

2. Select your **goal-tracker** project

3. Click **Settings** (gear icon in sidebar) → **Database**

4. Under **"Connection string"** section, find **Database password**
   - If you saved it during project creation, use that
   - If you lost it, click **"Reset database password"** to generate a new one
   - **⚠️ WARNING**: Resetting will break existing connections until you update them

5. **Add to GitHub**:
   - Name: `SUPABASE_DB_PASSWORD`
   - Value: Paste your database password
   - Click **"Add secret"**

---

## Verify Setup

After adding all three secrets, your repository should have:

- ✅ `GCP_SA_KEY` (Google Cloud Service Account JSON)
- ✅ `SUPABASE_ACCESS_TOKEN` (Supabase Personal Access Token)
- ✅ `SUPABASE_DB_PASSWORD` (Supabase Database Password)

You can verify in: **Settings → Secrets and variables → Actions → Repository secrets**

## Test the Workflow

To test that everything works:

1. Make a small change to your code (e.g., add a comment)
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Test deployment workflow"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Watch the **"Deploy to Cloud Run"** workflow run
5. It should:
   - ✅ Run database migrations
   - ✅ Build the Docker image
   - ✅ Deploy to Cloud Run
   - ✅ Pass health checks

## Troubleshooting

### "Invalid credentials" error

- **Check**: Make sure `GCP_SA_KEY` is valid JSON (starts with `{` and ends with `}`)
- **Fix**: Recreate the service account key

### "Permission denied" errors

- **Check**: Service account has all 4 required roles
- **Fix**: Go to IAM & Admin → IAM, find your service account, and add missing roles

### "Failed to link Supabase project"

- **Check**: `SUPABASE_ACCESS_TOKEN` is correct and not expired
- **Check**: `SUPABASE_DB_PASSWORD` matches your database password
- **Fix**: Regenerate the access token and/or reset database password

### "Migration failed"

- **Check**: Migrations are in `supabase/migrations/` directory
- **Check**: Migration SQL is valid
- **Fix**: Test migrations locally first with `./bin/supabase db reset`

## Security Best Practices

- ✅ Never commit secrets to your repository
- ✅ Rotate access tokens periodically
- ✅ Use minimal required permissions for service accounts
- ✅ Monitor GitHub Actions logs for suspicious activity
- ✅ Enable GitHub secret scanning (Settings → Security → Code security)

## Next Steps

Once secrets are configured:

1. Any push to `main` will automatically deploy
2. Database migrations will run before deployment
3. You can view deployment status in the Actions tab
4. Check deployment summary for the service URL

For more details, see [DEPLOYMENT.md](DEPLOYMENT.md)
