# Supabase Storage Setup Instructions

This document provides step-by-step instructions for configuring Supabase Storage policies for the goal-files bucket.

## Overview

The `goal-files` bucket has been created via database migration, but storage policies need to be configured manually through the Supabase Dashboard due to permission constraints in SQL migrations.

## Storage Bucket Details

- **Bucket Name**: `goal-files`
- **Public Access**: Disabled (files accessed via signed URLs)
- **File Size Limit**: 10MB per file
- **Max Files Per Goal**: 10 files

## Required Storage Policies

You need to create **3 policies** for the `goal-files` bucket in the Supabase Dashboard.

### Accessing the Storage Policies

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click on the **goal-files** bucket
5. Click on the **Policies** tab
6. Click **New Policy** for each of the policies below

---

## Policy 1: View Files (SELECT)

**Policy Name**: `Users can view files for accessible goals`

**Operation**: `SELECT`

**Target Roles**: `authenticated`

**Policy Definition** (USING clause):

```sql
(bucket_id = 'goal-files') AND (auth.uid() IS NOT NULL) AND (
    EXISTS (
        SELECT 1 FROM public.goal_files
        INNER JOIN public.goals ON goals.id = goal_files.goal_id
        WHERE goal_files.file_path = (storage.objects.name)
        AND goals.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.goal_files
        INNER JOIN public.goals ON goals.id = goal_files.goal_id
        WHERE goal_files.file_path = (storage.objects.name)
        AND goals.is_public = true
    )
    OR
    EXISTS (
        SELECT 1 FROM public.goal_files
        INNER JOIN public.goals ON goals.id = goal_files.goal_id
        INNER JOIN public.goal_teams ON goal_teams.goal_id = goals.id
        INNER JOIN public.team_members ON team_members.team_id = goal_teams.team_id
        WHERE goal_files.file_path = (storage.objects.name)
        AND team_members.user_id = auth.uid()
    )
)
```

**Description**: Allows users to download files from goals they own, public goals, or team goals they are members of.

**Note**: Make sure to use `storage.objects.name` (not just `name`) and explicitly qualify table names with `public.` schema.

---

## Policy 2: Upload Files (INSERT)

**Policy Name**: `Users can upload files to accessible goals`

**Operation**: `INSERT`

**Target Roles**: `authenticated`

**Policy Definition** (WITH CHECK clause):

```sql
(bucket_id = 'goal-files') AND (auth.uid() IS NOT NULL)
```

**Description**: Allows authenticated users to upload files. Additional access checks are performed in the application layer before upload.

**Note**: The application validates that users can only upload to goals they own or team goals they're members of before the upload occurs.

---

## Policy 3: Delete Files (DELETE)

**Policy Name**: `Users can delete their uploaded files`

**Operation**: `DELETE`

**Target Roles**: `authenticated`

**Policy Definition** (USING clause):

```sql
(bucket_id = 'goal-files') AND (auth.uid() IS NOT NULL) AND (
    EXISTS (
        SELECT 1 FROM public.goal_files
        WHERE goal_files.file_path = (storage.objects.name)
        AND goal_files.uploaded_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.goal_files
        INNER JOIN public.goals ON goals.id = goal_files.goal_id
        WHERE goal_files.file_path = (storage.objects.name)
        AND goals.user_id = auth.uid()
    )
)
```

**Description**: Allows users to delete files they uploaded or files on goals they own.

---

## Verification

After creating the policies, verify they're working correctly:

1. **Upload Test**: Try uploading a file to a goal via the UI
2. **Download Test**: Try downloading a file you uploaded
3. **Permission Test**: Ensure you cannot delete files uploaded by other users (unless you own the goal)
4. **Team Test**: Upload a file to a team goal and verify team members can view/download it

## Troubleshooting

### Files not uploading
- Check that all 3 policies are created
- Verify the `goal-files` bucket exists
- Check browser console for specific error messages
- Ensure you're authenticated

### Files not downloading
- Verify the SELECT policy is active
- Check that the file exists in `goal_files` table
- Ensure the file path matches between `goal_files.file_path` and storage

### Permission errors
- Double-check the SQL in each policy matches exactly
- Ensure policies target the `authenticated` role
- Verify RLS is enabled on the `goal_files` table

## Additional Configuration

### Allowed MIME Types
Currently set to `NULL` (all types allowed). To restrict file types, update the bucket settings:

```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
WHERE id = 'goal-files';
```

### File Size Limit
Currently set to 10MB. To adjust:

```sql
UPDATE storage.buckets
SET file_size_limit = 20971520  -- 20MB in bytes
WHERE id = 'goal-files';
```

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
