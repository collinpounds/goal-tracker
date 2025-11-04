-- Goal Tracker Database Schema
-- Run this on your Supabase database to create the necessary tables

CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    target_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Optional: Create a sample goal for testing
-- INSERT INTO goals (title, description, status, target_date)
-- VALUES ('My First Goal', 'This is a test goal', 'pending', NOW() + INTERVAL '7 days');
