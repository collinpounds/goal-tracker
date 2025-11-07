-- =====================================================
-- PRODUCTION MIGRATION - Goal Tracker Full Schema
-- =====================================================
-- Run this in your Production Supabase SQL Editor
-- This applies all missing migrations for teams and categories
-- =====================================================

-- =====================================================
-- 1. ADD IS_PUBLIC COLUMN TO GOALS
-- =====================================================

ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_goals_is_public ON goals(is_public);

-- Update existing RLS policies to include public goals
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
CREATE POLICY "Users can view own and public goals" ON goals
    FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

-- =====================================================
-- 2. TEAMS FEATURE
-- =====================================================

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_theme VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    nesting_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_name_per_parent UNIQUE (name, parent_team_id),
    CONSTRAINT check_max_nesting_depth CHECK (nesting_level <= 2)
);

CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_parent_team_id ON teams(parent_team_id);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_membership UNIQUE (team_id, user_id),
    CONSTRAINT check_valid_role CHECK (role IN ('owner', 'member'))
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    CONSTRAINT check_valid_invitation_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invite_code ON team_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_valid_notification_type CHECK (type IN (
        'team_invitation',
        'team_member_added',
        'team_member_removed',
        'team_goal_assigned',
        'team_goal_completed',
        'team_deleted'
    ))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create goal_teams junction table
CREATE TABLE IF NOT EXISTS goal_teams (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_goal_team_assignment UNIQUE (goal_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_teams_goal_id ON goal_teams(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_teams_team_id ON goal_teams(team_id);

-- Add scope column to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS scope VARCHAR(20) NOT NULL DEFAULT 'private';
ALTER TABLE goals DROP CONSTRAINT IF EXISTS check_valid_goal_scope;
ALTER TABLE goals ADD CONSTRAINT check_valid_goal_scope CHECK (scope IN ('private', 'public', 'team'));
CREATE INDEX IF NOT EXISTS idx_goals_scope ON goals(scope);

-- =====================================================
-- 3. CATEGORIES FEATURE
-- =====================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Create goal_categories junction table
CREATE TABLE IF NOT EXISTS goal_categories (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_goal_category_assignment UNIQUE (goal_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_categories_goal_id ON goal_categories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_categories_category_id ON goal_categories(category_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;

-- TEAMS POLICIES
CREATE POLICY "Users can view their teams" ON teams
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid())
    );

CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team owners can update teams" ON teams
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid() AND team_members.role = 'owner')
    );

CREATE POLICY "Team owners can delete teams" ON teams
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid() AND team_members.role = 'owner')
    );

-- TEAM MEMBERS POLICIES
CREATE POLICY "Users can view team members" ON team_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
    );

CREATE POLICY "Team owners can add members" ON team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role = 'owner'))
        )
    );

CREATE POLICY "Team owners can update members" ON team_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role = 'owner'))
        )
    );

CREATE POLICY "Team owners can remove members" ON team_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role = 'owner'))
        ) OR user_id = auth.uid()
    );

-- TEAM INVITATIONS POLICIES
CREATE POLICY "Users can view relevant invitations" ON team_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = team_invitations.team_id AND team_members.user_id = auth.uid() AND team_members.role = 'owner')
    );

CREATE POLICY "Team owners can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_invitations.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role = 'owner'))
        )
    );

CREATE POLICY "Users can respond to invitations" ON team_invitations
    FOR UPDATE USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR invited_by = auth.uid()
    );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow notification creation" ON notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- GOAL TEAMS POLICIES
CREATE POLICY "Team members can view goal assignments" ON goal_teams
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = goal_teams.team_id AND team_members.user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_teams.goal_id AND goals.user_id = auth.uid())
    );

CREATE POLICY "Team members can assign goals" ON goal_teams
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = goal_teams.team_id AND team_members.user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_teams.goal_id AND goals.user_id = auth.uid())
    );

CREATE POLICY "Goal owners can remove team assignments" ON goal_teams
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_teams.goal_id AND goals.user_id = auth.uid())
    );

-- CATEGORIES POLICIES
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own categories" ON categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (user_id = auth.uid());

-- GOAL CATEGORIES POLICIES
CREATE POLICY "Users can view own goal categories" ON goal_categories
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id AND goals.user_id = auth.uid())
    );

CREATE POLICY "Users can assign categories to own goals" ON goal_categories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id AND goals.user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM categories WHERE categories.id = goal_categories.category_id AND categories.user_id = auth.uid())
    );

CREATE POLICY "Users can remove categories from own goals" ON goal_categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_categories.goal_id AND goals.user_id = auth.uid())
    );

-- =====================================================
-- 5. HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to add team creator as owner
CREATE OR REPLACE FUNCTION add_team_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role, invited_by)
    VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_add_team_creator ON teams;
CREATE TRIGGER trigger_add_team_creator
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_creator_as_owner();

-- Function to update team timestamp
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_timestamp ON teams;
CREATE TRIGGER trigger_update_team_timestamp
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_team_timestamp();

-- Function to calculate nesting level
CREATE OR REPLACE FUNCTION calculate_nesting_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_team_id IS NULL THEN
        NEW.nesting_level = 0;
    ELSE
        SELECT nesting_level + 1 INTO NEW.nesting_level
        FROM teams WHERE id = NEW.parent_team_id;

        IF NEW.nesting_level > 2 THEN
            RAISE EXCEPTION 'Maximum team nesting depth (3 levels) exceeded';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_nesting_level ON teams;
CREATE TRIGGER trigger_calculate_nesting_level
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION calculate_nesting_level();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- All tables, indexes, policies, and triggers have been created
-- Your production database now matches your local schema
-- =====================================================
