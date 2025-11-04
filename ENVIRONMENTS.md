# Environment Management Guide

This project supports running with either **local Supabase** or **production Supabase**. Here's how to easily switch between them.

## Quick Start

### Run with Local Supabase (Development)

```bash
./run-local.sh
```

This will:
- Start local Supabase (if not running)
- Copy `.env.local` to `.env`
- Start Docker containers
- Connect to local Supabase at `http://localhost:54321`

### Run with Production Supabase

```bash
./run-production.sh
```

This will:
- Copy `.env.production` to `.env`
- Start Docker containers
- Connect to hosted Supabase at `https://bnmdrvslwmuimlpkqqfq.supabase.co`

## Environment Files

### `.env.local` - Local Development
```env
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Uses local Supabase running in Docker
- Data is temporary (reset with `./bin/supabase stop --no-backup`)
- Access Supabase Studio at http://localhost:54323

### `.env.production` - Production Database
```env
SUPABASE_URL=https://bnmdrvslwmuimlpkqqfq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Uses hosted Supabase
- Data persists in the cloud
- Access Supabase Dashboard at https://app.supabase.com

## Manual Switching (Alternative Method)

If you prefer to manually switch:

### Switch to Local
```bash
cp .env.local .env
docker-compose restart backend
```

### Switch to Production
```bash
cp .env.production .env
docker-compose restart backend
```

## Docker Compose with --env-file (Advanced)

You can also use docker-compose's `--env-file` flag:

```bash
# Local mode
docker-compose --env-file .env.local up -d

# Production mode
docker-compose --env-file .env.production up -d
```

## Checking Current Environment

To see which environment you're currently using:

```bash
grep "SUPABASE_URL" .env
```

You should see either:
- `http://host.docker.internal:54321` (Local)
- `https://bnmdrvslwmuimlpkqqfq.supabase.co` (Production)

## Environment Comparison

| Feature | Local | Production |
|---------|-------|------------|
| **Database** | Docker Container | Hosted Supabase |
| **Data Persistence** | Temporary | Permanent |
| **Supabase URL** | localhost:54321 | bnmdrvslwmuimlpkqqfq.supabase.co |
| **Studio Access** | localhost:54323 | app.supabase.com |
| **Best For** | Development, Testing | Staging, Production |
| **Internet Required** | No | Yes |

## Database Migrations

### Local → Production

To push your local schema to production:

```bash
./bin/supabase db push
```

### Production → Local

To pull production schema to local:

```bash
./bin/supabase db pull
```

## Tips

1. **Always use local for development** to avoid affecting production data
2. **Test migrations locally first** before pushing to production
3. **Use production for final testing** before deploying
4. **Keep `.env.production` secure** - never commit it to git

## Troubleshooting

### Local Supabase not connecting?
```bash
./bin/supabase status  # Check if running
./bin/supabase start   # Start if not running
```

### Production not connecting?
- Check your internet connection
- Verify credentials in `.env.production`
- Check Supabase project status in dashboard

### Port conflicts?
If port 54321 is in use:
```bash
./bin/supabase stop
# Kill other process using the port
./bin/supabase start
```

## Git Ignore

Make sure these files are in your `.gitignore`:
```
.env
.env.local
.env.production
```

Only commit `.env.example` with placeholder values.
