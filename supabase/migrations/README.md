# Database Migrations

This directory contains SQL migrations for the Goal Tracker database.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Manual Setup)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy the contents of each migration file (in order by timestamp)
5. Paste and execute in the SQL Editor

### Option 2: Supabase CLI (Recommended for Development)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: GitHub Actions (Automated Deployment)

Migrations are automatically applied during deployment via GitHub Actions.

## Migration Files

1. **20250104000000_create_goals_table.sql** - Initial goals table
2. **20251105010103_add_auth.sql** - Authentication setup
3. **20251105020000_add_is_public_to_goals.sql** - Public goals feature
4. **20251105030000_add_teams_feature.sql** - **NEW** - Teams feature with:
   - Teams table (supports nesting up to 3 levels)
   - Team members table (owner/member roles)
   - Team invitations table (email + shareable link invites)
   - Notifications table (team events)
   - Goal-team associations (many-to-many)
   - Row Level Security policies
   - Auto-triggers for team management

## Important Notes

- **Apply migrations in order** (by timestamp in filename)
- The teams migration must be applied after the auth and public goals migrations
- All migrations are idempotent (safe to run multiple times)
- RLS (Row Level Security) policies are automatically enabled

## Teams Feature Schema

### New Tables

1. **teams** - Team information with nested team support
2. **team_members** - Team membership with roles
3. **team_invitations** - Email and link-based invitations
4. **notifications** - User notifications for team events
5. **goal_teams** - Many-to-many relationship between goals and teams

### Color Palette for Teams

Teams can use these predefined colors:
- `#3B82F6` (Blue)
- `#10B981` (Green)
- `#F59E0B` (Amber)
- `#EF4444` (Red)
- `#8B5CF6` (Purple)
- `#EC4899` (Pink)
- `#14B8A6` (Teal)
- `#F97316` (Orange)
- `#6366F1` (Indigo)
- `#06B6D4` (Cyan)

## Troubleshooting

If you encounter errors:

1. **Permission denied** - Ensure you have admin access to the Supabase project
2. **Table already exists** - Migrations use `IF NOT EXISTS` clauses, so this is safe
3. **Foreign key constraint fails** - Ensure migrations are applied in order
4. **RLS policy conflicts** - Drop existing policies first if needed

For help, refer to [Supabase Documentation](https://supabase.com/docs/guides/cli)
