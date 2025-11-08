-- =====================================================
-- Supabase Storage Setup for Goal Files
-- Creates bucket (policies managed via Supabase Dashboard)
-- =====================================================

-- Create storage bucket for goal files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'goal-files',
    'goal-files',
    FALSE, -- Not public by default, access controlled by policies
    10485760, -- 10MB in bytes
    NULL -- Allow all MIME types
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Note about Storage Policies
-- =====================================================
-- Storage policies need to be created via Supabase Dashboard or using
-- the storage-specific admin API. They cannot be created via regular
-- SQL migrations due to permission constraints.
--
-- Required policies for 'goal-files' bucket:
--
-- 1. SELECT policy: "Users can view files for accessible goals"
--    USING: User owns goal OR goal is public OR user is team member
--
-- 2. INSERT policy: "Users can upload files to accessible goals"
--    WITH CHECK: User is authenticated and uploading to goal-files bucket
--
-- 3. DELETE policy: "Users can delete their uploaded files"
--    USING: User uploaded file OR user owns goal
--
-- These can be configured in: Supabase Dashboard > Storage > Policies
