-- =====================================================
-- Categories Feature Migration
-- Adds support for user-defined categories to organize goals
-- =====================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    icon VARCHAR(50), -- Icon identifier (optional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure category names are unique per user
    CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name)
);

-- Index for faster category queries
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 2. Create goal_categories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS goal_categories (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure a goal can only be assigned to a category once
    CONSTRAINT unique_goal_category_assignment UNIQUE (goal_id, category_id)
);

-- Indexes for goal-category queries
CREATE INDEX IF NOT EXISTS idx_goal_categories_goal_id ON goal_categories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_categories_category_id ON goal_categories(category_id);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLICIES --

-- Drop existing policies if they exist to make migration idempotent
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own categories" ON categories;
    DROP POLICY IF EXISTS "Users can create own categories" ON categories;
    DROP POLICY IF EXISTS "Users can update own categories" ON categories;
    DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
    DROP POLICY IF EXISTS "Users can view own goal categories" ON goal_categories;
    DROP POLICY IF EXISTS "Users can assign categories to own goals" ON goal_categories;
    DROP POLICY IF EXISTS "Users can remove categories from own goals" ON goal_categories;
END $$;

-- Users can view their own categories
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own categories
CREATE POLICY "Users can create own categories" ON categories
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own categories
CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE
    USING (user_id = auth.uid());

-- GOAL CATEGORIES POLICIES --

-- Users can view category assignments for their own goals
CREATE POLICY "Users can view own goal categories" ON goal_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_categories.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Users can assign categories to their own goals
CREATE POLICY "Users can assign categories to own goals" ON goal_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_categories.goal_id
            AND goals.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM categories
            WHERE categories.id = goal_categories.category_id
            AND categories.user_id = auth.uid()
        )
    );

-- Users can remove category assignments from their own goals
CREATE POLICY "Users can remove categories from own goals" ON goal_categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_categories.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE categories IS 'User-defined categories for organizing goals';
COMMENT ON TABLE goal_categories IS 'Many-to-many relationship between goals and categories';
COMMENT ON COLUMN categories.color IS 'Hex color code for category badge (e.g., #FF5733)';
COMMENT ON COLUMN categories.icon IS 'Icon identifier for category display';