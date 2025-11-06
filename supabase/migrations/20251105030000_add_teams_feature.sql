-- =====================================================
-- Teams Feature Migration
-- Adds support for teams, team members, invitations,
-- notifications, and goal-team associations
-- =====================================================

-- 1. Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_theme VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    nesting_level INTEGER NOT NULL DEFAULT 0, -- Track depth for max 3 levels
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure team names are unique within the same parent
    CONSTRAINT unique_team_name_per_parent UNIQUE (name, parent_team_id),
    -- Enforce max nesting depth of 3
    CONSTRAINT check_max_nesting_depth CHECK (nesting_level <= 2)
);

-- Index for faster team queries
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_parent_team_id ON teams(parent_team_id);

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- owner, member
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure a user can only be a member once per team
    CONSTRAINT unique_team_membership UNIQUE (team_id, user_id),
    -- Validate role values
    CONSTRAINT check_valid_role CHECK (role IN ('owner', 'member'))
);

-- Indexes for team member queries
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- 3. Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) NOT NULL UNIQUE, -- Unique code for shareable links
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, expired
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

    -- Validate status values
    CONSTRAINT check_valid_invitation_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- Indexes for invitation queries
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invite_code ON team_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- team_invitation, team_member_added, team_goal_assigned, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT, -- ID of related entity (invitation, team, goal, etc.)
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validate notification type
    CONSTRAINT check_valid_notification_type CHECK (type IN (
        'team_invitation',
        'team_member_added',
        'team_member_removed',
        'team_goal_assigned',
        'team_goal_completed',
        'team_deleted'
    ))
);

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 5. Create goal_teams junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS goal_teams (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure a goal can only be assigned to a team once
    CONSTRAINT unique_goal_team_assignment UNIQUE (goal_id, team_id)
);

-- Indexes for goal-team queries
CREATE INDEX IF NOT EXISTS idx_goal_teams_goal_id ON goal_teams(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_teams_team_id ON goal_teams(team_id);

-- 6. Add scope column to goals table (for filtering)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS scope VARCHAR(20) NOT NULL DEFAULT 'private';
ALTER TABLE goals ADD CONSTRAINT check_valid_goal_scope CHECK (scope IN ('private', 'public', 'team'));

-- Index for scope filtering
CREATE INDEX IF NOT EXISTS idx_goals_scope ON goals(scope);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_teams ENABLE ROW LEVEL SECURITY;

-- TEAMS POLICIES --

-- Users can view teams they are members of
CREATE POLICY "Users can view their teams" ON teams
    FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

-- Users can create teams (creator becomes owner automatically)
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Team owners can update their teams
CREATE POLICY "Team owners can update teams" ON teams
    FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        )
    );

-- Team owners can delete their teams
CREATE POLICY "Team owners can delete teams" ON teams
    FOR DELETE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        )
    );

-- TEAM MEMBERS POLICIES --

-- Users can view members of teams they belong to
CREATE POLICY "Users can view team members" ON team_members
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
        )
    );

-- Team owners can add members
CREATE POLICY "Team owners can add members" ON team_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM team_members tm
                     WHERE tm.team_id = teams.id
                     AND tm.user_id = auth.uid()
                     AND tm.role = 'owner'
                 ))
        )
    );

-- Team owners can update member roles
CREATE POLICY "Team owners can update members" ON team_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM team_members tm
                     WHERE tm.team_id = teams.id
                     AND tm.user_id = auth.uid()
                     AND tm.role = 'owner'
                 ))
        )
    );

-- Team owners can remove members
CREATE POLICY "Team owners can remove members" ON team_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM team_members tm
                     WHERE tm.team_id = teams.id
                     AND tm.user_id = auth.uid()
                     AND tm.role = 'owner'
                 ))
        ) OR
        user_id = auth.uid() -- Users can remove themselves
    );

-- TEAM INVITATIONS POLICIES --

-- Users can view invitations for their teams or sent to them
CREATE POLICY "Users can view relevant invitations" ON team_invitations
    FOR SELECT
    USING (
        invited_by = auth.uid() OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_invitations.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        )
    );

-- Team owners can create invitations
CREATE POLICY "Team owners can create invitations" ON team_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_invitations.team_id
            AND (teams.created_by = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM team_members tm
                     WHERE tm.team_id = teams.id
                     AND tm.user_id = auth.uid()
                     AND tm.role = 'owner'
                 ))
        )
    );

-- Users can update invitations sent to them (accept/decline)
CREATE POLICY "Users can respond to invitations" ON team_invitations
    FOR UPDATE
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        invited_by = auth.uid()
    );

-- NOTIFICATIONS POLICIES --

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

-- System can insert notifications (handled by backend)
CREATE POLICY "Allow notification creation" ON notifications
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE
    USING (user_id = auth.uid());

-- GOAL TEAMS POLICIES --

-- Team members can view goal-team assignments for their teams
CREATE POLICY "Team members can view goal assignments" ON goal_teams
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = goal_teams.team_id
            AND team_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_teams.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Team members can assign goals to their teams
CREATE POLICY "Team members can assign goals" ON goal_teams
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = goal_teams.team_id
            AND team_members.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_teams.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Goal owners can remove team assignments
CREATE POLICY "Goal owners can remove team assignments" ON goal_teams
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_teams.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to automatically add creator as team owner
CREATE OR REPLACE FUNCTION add_team_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role, invited_by)
    VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add creator as owner after team creation
DROP TRIGGER IF EXISTS trigger_add_team_creator ON teams;
CREATE TRIGGER trigger_add_team_creator
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_creator_as_owner();

-- Function to update team updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on team updates
DROP TRIGGER IF EXISTS trigger_update_team_timestamp ON teams;
CREATE TRIGGER trigger_update_team_timestamp
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_team_timestamp();

-- Function to calculate nesting level based on parent
CREATE OR REPLACE FUNCTION calculate_nesting_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_team_id IS NULL THEN
        NEW.nesting_level = 0;
    ELSE
        SELECT nesting_level + 1 INTO NEW.nesting_level
        FROM teams
        WHERE id = NEW.parent_team_id;

        -- Enforce max nesting depth
        IF NEW.nesting_level > 2 THEN
            RAISE EXCEPTION 'Maximum team nesting depth (3 levels) exceeded';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate nesting level before team creation
DROP TRIGGER IF EXISTS trigger_calculate_nesting_level ON teams;
CREATE TRIGGER trigger_calculate_nesting_level
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION calculate_nesting_level();

-- Function to auto-expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE team_invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Predefined Color Palette for Teams
-- =====================================================
-- Teams can choose from these colors:
-- #3B82F6 (Blue), #10B981 (Green), #F59E0B (Amber),
-- #EF4444 (Red), #8B5CF6 (Purple), #EC4899 (Pink),
-- #14B8A6 (Teal), #F97316 (Orange), #6366F1 (Indigo),
-- #06B6D4 (Cyan)

COMMENT ON COLUMN teams.color_theme IS 'Hex color code for team theme (predefined palette)';
COMMENT ON TABLE teams IS 'Teams table supporting nested teams (max 3 levels deep)';
COMMENT ON TABLE team_members IS 'Team membership with owner/member roles';
COMMENT ON TABLE team_invitations IS 'Team invitations via email or shareable link';
COMMENT ON TABLE notifications IS 'User notifications for team events';
COMMENT ON TABLE goal_teams IS 'Many-to-many relationship between goals and teams';
