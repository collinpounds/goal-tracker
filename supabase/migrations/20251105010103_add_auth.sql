-- ============================================================================
-- Goal Tracker - Authentication Migration
-- ============================================================================
-- This migration adds user authentication support to the Goal Tracker app
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Add user_id column to goals table
-- ============================================================================
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Step 3: Handle existing data (OPTIONAL - uncomment one option)
-- ============================================================================
-- Option A: Delete existing goals without user_id
-- DELETE FROM goals WHERE user_id IS NULL;

-- Option B: Assign existing goals to a specific user (replace <USER_UUID> with actual user ID)
-- UPDATE goals SET user_id = '<USER_UUID>' WHERE user_id IS NULL;

-- Step 4: Make user_id required for new records (uncomment after handling existing data)
-- ============================================================================
-- ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;

-- Step 5: Remove old development RLS policy
-- ============================================================================
DROP POLICY IF EXISTS "Allow all operations for local dev" ON goals;

-- Step 6: Enable Row Level Security (if not already enabled)
-- ============================================================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Step 7: Create user-scoped RLS policies
-- ============================================================================

-- SELECT: Users can view only their own goals
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can create goals with their own user_id
CREATE POLICY "Users can create their own goals" ON goals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update only their own goals
CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete only their own goals
CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 8: Admin role policy (OPTIONAL - uncomment if you want admin access)
-- ============================================================================
-- CREATE POLICY "Admins can view all goals" ON goals
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.users.id = auth.uid()
--             AND (auth.users.raw_app_meta_data->>'role')::text = 'admin'
--         )
--     );

-- CREATE POLICY "Admins can update all goals" ON goals
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.users.id = auth.uid()
--             AND (auth.users.raw_app_meta_data->>'role')::text = 'admin'
--         )
--     );

-- CREATE POLICY "Admins can delete all goals" ON goals
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.users.id = auth.uid()
--             AND (auth.users.raw_app_meta_data->>'role')::text = 'admin'
--         )
--     );

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check if user_id column was added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'goals' AND column_name = 'user_id';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'goals';

-- Check existing goals (should show user_id values)
-- SELECT id, title, user_id, created_at FROM goals LIMIT 10;

-- ============================================================================
-- HOW TO ASSIGN ADMIN ROLE TO A USER
-- ============================================================================
-- Run this in Supabase SQL Editor to make a user an admin:
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@example.com';
--
-- ============================================================================
