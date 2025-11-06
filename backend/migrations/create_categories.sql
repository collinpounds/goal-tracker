-- Migration: Create categories and goal_categories tables
-- Description: Adds support for user-defined categories with many-to-many relationship to goals

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    icon VARCHAR(50), -- Optional icon name (e.g., 'briefcase', 'heart', 'star')
    user_id TEXT NOT NULL, -- Owner of the category
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT categories_name_user_unique UNIQUE (name, user_id)
);

-- Create goal_categories junction table (many-to-many)
CREATE TABLE IF NOT EXISTS goal_categories (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT goal_categories_unique UNIQUE (goal_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_categories_goal_id ON goal_categories(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_categories_category_id ON goal_categories(category_id);

-- Add comment for documentation
COMMENT ON TABLE categories IS 'User-defined categories for organizing goals';
COMMENT ON TABLE goal_categories IS 'Junction table linking goals to categories (many-to-many relationship)';
