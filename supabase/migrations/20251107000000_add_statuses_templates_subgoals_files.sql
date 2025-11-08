-- =====================================================
-- Enhanced Goal Features Migration
-- Adds custom statuses, goal templates, sub-goals, and file attachments
-- =====================================================

-- =====================================================
-- 1. USER CUSTOM STATUSES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_statuses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    icon VARCHAR(50), -- Icon identifier (optional)
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure status names are unique per user
    CONSTRAINT unique_user_status_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_statuses_user_id ON user_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statuses_order ON user_statuses(user_id, display_order);

-- =====================================================
-- 2. TEAM CUSTOM STATUSES
-- =====================================================

CREATE TABLE IF NOT EXISTS team_statuses (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    icon VARCHAR(50), -- Icon identifier (optional)
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure status names are unique per team
    CONSTRAINT unique_team_status_name UNIQUE (team_id, name)
);

CREATE INDEX IF NOT EXISTS idx_team_statuses_team_id ON team_statuses(team_id);
CREATE INDEX IF NOT EXISTS idx_team_statuses_order ON team_statuses(team_id, display_order);

-- =====================================================
-- 3. GOAL TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS goal_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Template name
    title_template VARCHAR(200) NOT NULL, -- Goal title template
    description_template TEXT,
    default_status VARCHAR(50), -- Can be custom status name
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_type VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    recurrence_interval INTEGER DEFAULT 1, -- Every N days/weeks/months
    is_shared BOOLEAN NOT NULL DEFAULT FALSE, -- Can others use this template?
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_recurrence CHECK (
        (is_recurring = FALSE) OR
        (is_recurring = TRUE AND recurrence_type IN ('daily', 'weekly', 'monthly'))
    )
);

CREATE INDEX IF NOT EXISTS idx_goal_templates_user_id ON goal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_templates_shared ON goal_templates(is_shared) WHERE is_shared = TRUE;

-- Junction table for template default categories
CREATE TABLE IF NOT EXISTS template_categories (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES goal_templates(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

    CONSTRAINT unique_template_category UNIQUE (template_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_template_categories_template_id ON template_categories(template_id);

-- Junction table for template default teams
CREATE TABLE IF NOT EXISTS template_teams (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES goal_templates(id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    CONSTRAINT unique_template_team UNIQUE (template_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_template_teams_template_id ON template_teams(template_id);

-- =====================================================
-- 4. SUB-GOALS (Self-referential Goals)
-- =====================================================

-- Add parent_goal_id and order to existing goals table
DO $$
BEGIN
    -- Add parent_goal_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'goals' AND column_name = 'parent_goal_id'
    ) THEN
        ALTER TABLE goals ADD COLUMN parent_goal_id BIGINT REFERENCES goals(id) ON DELETE CASCADE;
    END IF;

    -- Add order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'goals' AND column_name = 'display_order'
    ) THEN
        ALTER TABLE goals ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add template_id column if it doesn't exist (track which template created this goal)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'goals' AND column_name = 'template_id'
    ) THEN
        ALTER TABLE goals ADD COLUMN template_id BIGINT REFERENCES goal_templates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for sub-goal queries
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_goal_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent_order ON goals(parent_goal_id, display_order);
CREATE INDEX IF NOT EXISTS idx_goals_template_id ON goals(template_id);

-- =====================================================
-- 5. GOAL FILES (Attachments)
-- =====================================================

CREATE TABLE IF NOT EXISTS goal_files (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_size INTEGER NOT NULL, -- Size in bytes
    mime_type VARCHAR(127),
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint: max 10 files per goal
    CONSTRAINT check_file_size CHECK (file_size <= 10485760) -- 10MB in bytes
);

CREATE INDEX IF NOT EXISTS idx_goal_files_goal_id ON goal_files(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_files_uploaded_by ON goal_files(uploaded_by);

-- Function to enforce max 10 files per goal
CREATE OR REPLACE FUNCTION check_max_files_per_goal()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM goal_files WHERE goal_id = NEW.goal_id) >= 10 THEN
        RAISE EXCEPTION 'Maximum of 10 files per goal exceeded';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce max files limit
DROP TRIGGER IF EXISTS enforce_max_files_per_goal ON goal_files;
CREATE TRIGGER enforce_max_files_per_goal
    BEFORE INSERT ON goal_files
    FOR EACH ROW
    EXECUTE FUNCTION check_max_files_per_goal();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER STATUSES POLICIES
-- =====================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own statuses" ON user_statuses;
    DROP POLICY IF EXISTS "Users can create own statuses" ON user_statuses;
    DROP POLICY IF EXISTS "Users can update own statuses" ON user_statuses;
    DROP POLICY IF EXISTS "Users can delete own statuses" ON user_statuses;
END $$;

CREATE POLICY "Users can view own statuses" ON user_statuses
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own statuses" ON user_statuses
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own statuses" ON user_statuses
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own statuses" ON user_statuses
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- TEAM STATUSES POLICIES
-- =====================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Team members can view team statuses" ON team_statuses;
    DROP POLICY IF EXISTS "Team owners can manage team statuses" ON team_statuses;
    DROP POLICY IF EXISTS "Team owners can update team statuses" ON team_statuses;
    DROP POLICY IF EXISTS "Team owners can delete team statuses" ON team_statuses;
END $$;

-- Team members can view team statuses
CREATE POLICY "Team members can view team statuses" ON team_statuses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_statuses.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Only team owners can create team statuses
CREATE POLICY "Team owners can manage team statuses" ON team_statuses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_statuses.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        ) AND created_by = auth.uid()
    );

-- Only team owners can update team statuses
CREATE POLICY "Team owners can update team statuses" ON team_statuses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_statuses.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        )
    );

-- Only team owners can delete team statuses
CREATE POLICY "Team owners can delete team statuses" ON team_statuses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_statuses.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'owner'
        )
    );

-- =====================================================
-- GOAL TEMPLATES POLICIES
-- =====================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own and shared templates" ON goal_templates;
    DROP POLICY IF EXISTS "Users can create own templates" ON goal_templates;
    DROP POLICY IF EXISTS "Users can update own templates" ON goal_templates;
    DROP POLICY IF EXISTS "Users can delete own templates" ON goal_templates;
END $$;

CREATE POLICY "Users can view own and shared templates" ON goal_templates
    FOR SELECT
    USING (user_id = auth.uid() OR is_shared = TRUE);

CREATE POLICY "Users can create own templates" ON goal_templates
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates" ON goal_templates
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates" ON goal_templates
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- TEMPLATE JUNCTION TABLES POLICIES
-- =====================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own template categories" ON template_categories;
    DROP POLICY IF EXISTS "Users can manage own template categories" ON template_categories;
    DROP POLICY IF EXISTS "Users can delete own template categories" ON template_categories;
    DROP POLICY IF EXISTS "Users can view own template teams" ON template_teams;
    DROP POLICY IF EXISTS "Users can manage own template teams" ON template_teams;
    DROP POLICY IF EXISTS "Users can delete own template teams" ON template_teams;
END $$;

CREATE POLICY "Users can view own template categories" ON template_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_categories.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own template categories" ON template_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_categories.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own template categories" ON template_categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_categories.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own template teams" ON template_teams
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_teams.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own template teams" ON template_teams
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_teams.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own template teams" ON template_teams
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM goal_templates
            WHERE goal_templates.id = template_teams.template_id
            AND goal_templates.user_id = auth.uid()
        )
    );

-- =====================================================
-- GOAL FILES POLICIES
-- =====================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view files for accessible goals" ON goal_files;
    DROP POLICY IF EXISTS "Users and team members can upload files" ON goal_files;
    DROP POLICY IF EXISTS "Users and team members can delete files" ON goal_files;
END $$;

-- Users can view files for goals they have access to
CREATE POLICY "Users can view files for accessible goals" ON goal_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_files.goal_id
            AND (
                goals.user_id = auth.uid() -- Own goal
                OR goals.is_public = TRUE -- Public goal
                OR EXISTS ( -- Team goal
                    SELECT 1 FROM goal_teams
                    JOIN team_members ON team_members.team_id = goal_teams.team_id
                    WHERE goal_teams.goal_id = goals.id
                    AND team_members.user_id = auth.uid()
                )
            )
        )
    );

-- Users can upload files to their own goals or team goals they're members of
CREATE POLICY "Users and team members can upload files" ON goal_files
    FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_files.goal_id
            AND (
                goals.user_id = auth.uid() -- Own goal
                OR EXISTS ( -- Team goal
                    SELECT 1 FROM goal_teams
                    JOIN team_members ON team_members.team_id = goal_teams.team_id
                    WHERE goal_teams.goal_id = goals.id
                    AND team_members.user_id = auth.uid()
                )
            )
        )
    );

-- Users can delete files they uploaded or files on their own goals
CREATE POLICY "Users and team members can delete files" ON goal_files
    FOR DELETE
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_files.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE user_statuses IS 'Custom status values defined by individual users';
COMMENT ON TABLE team_statuses IS 'Custom status values defined by teams';
COMMENT ON TABLE goal_templates IS 'Reusable goal templates with default values and recurrence settings';
COMMENT ON TABLE template_categories IS 'Default categories for goal templates';
COMMENT ON TABLE template_teams IS 'Default team assignments for goal templates';
COMMENT ON TABLE goal_files IS 'File attachments for goals stored in Supabase Storage';
COMMENT ON COLUMN goals.parent_goal_id IS 'Reference to parent goal for sub-goal hierarchy';
COMMENT ON COLUMN goals.display_order IS 'Order of sub-goals within parent goal';
COMMENT ON COLUMN goals.template_id IS 'Reference to template that created this goal';
COMMENT ON COLUMN goal_files.file_path IS 'Path to file in Supabase Storage bucket';
