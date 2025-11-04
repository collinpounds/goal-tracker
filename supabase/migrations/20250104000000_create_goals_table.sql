-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for local development)
CREATE POLICY "Allow all operations for local dev" ON goals
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO goals (title, description, status, target_date) VALUES
    ('Learn Supabase', 'Master the Supabase platform and its features', 'in_progress', NOW() + INTERVAL '30 days'),
    ('Build Goal Tracker', 'Complete the goal tracking application', 'in_progress', NOW() + INTERVAL '14 days'),
    ('Deploy to Production', 'Deploy the app to production environment', 'pending', NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;
