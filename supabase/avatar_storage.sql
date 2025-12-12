-- ==============================================
-- Avatar Storage Setup
-- ==============================================
-- Run this in Supabase SQL Editor to enable avatar uploads
--
-- IMPORTANT: If you get "must be owner of table objects" error,
-- use Supabase Dashboard instead:
-- 1. Go to Storage > New Bucket > Create "avatars" bucket
-- 2. Set bucket as Public
-- 3. Add policies through Dashboard UI
--
-- OR run this script as the postgres/service_role user

-- Step 1: Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true,  -- Public bucket for avatar URLs
  2097152,  -- 2MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
  -- Try to drop existing policies - ignore errors if they don't exist
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors
  NULL;
END $$;

-- Step 3: Create storage policies
-- Note: RLS is already enabled on storage.objects by Supabase

-- Policy: Allow authenticated users to upload avatar
-- The filename format: {user_id}-{timestamp}.{ext}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Policy: Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Policy: Allow users to delete their own avatar  
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Policy: Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ==============================================
-- Alternative: Manual Setup via Supabase Dashboard
-- ==============================================
-- If SQL policies fail, follow these steps:
--
-- 1. Storage > Buckets > New Bucket
--    - Name: avatars
--    - Public: ON
--    - File size limit: 2MB
--    - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
--
-- 2. Click on "avatars" bucket > Policies > New Policy
--
-- 3. Create INSERT policy:
--    - Name: "Users can upload their own avatar"
--    - Target roles: authenticated
--    - WITH CHECK: (auth.uid()::text = split_part(name, '-', 1))
--
-- 4. Create UPDATE policy:
--    - Name: "Users can update their own avatar"  
--    - Target roles: authenticated
--    - USING: (auth.uid()::text = split_part(name, '-', 1))
--
-- 5. Create DELETE policy:
--    - Name: "Users can delete their own avatar"
--    - Target roles: authenticated
--    - USING: (auth.uid()::text = split_part(name, '-', 1))
--
-- 6. Create SELECT policy:
--    - Name: "Avatar images are publicly accessible"
--    - Target roles: public
--    - USING: true
