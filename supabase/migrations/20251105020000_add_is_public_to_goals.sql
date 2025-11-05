-- Add is_public column to goals table
ALTER TABLE goals
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster querying of public goals
CREATE INDEX idx_goals_is_public ON goals(is_public);
