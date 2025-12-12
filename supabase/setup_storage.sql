-- ============================================================
-- Setup Supabase Storage for File Attachments
-- Run this in Supabase SQL Editor after running migrations
-- ============================================================

-- 1. Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'attachments',
    'attachments',
    false,  -- Private bucket (access via signed URLs)
    5242880,  -- 5MB max file size (5 * 1024 * 1024)
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage policies - Allow authenticated users to upload
CREATE POLICY storage_attachments_insert
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- 3. Storage policies - Allow users to read their own files or request-related files
CREATE POLICY storage_attachments_select
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'attachments' 
    AND (
        -- Owner can read their own files
        (storage.foldername(name))[1] = auth.uid()::text
        OR
        -- Files attached to requests the user can view
        EXISTS (
            SELECT 1 FROM public.attachments a
            JOIN public.requests r ON r.id = a.request_id
            WHERE a.file_url LIKE '%' || storage.objects.name
            AND (
                r.created_by = auth.uid()
                OR r.assignee_id = auth.uid()
                OR user_has_role(auth.uid(), 'admin')
                OR user_has_role(auth.uid(), 'manager')
            )
        )
    )
);

-- 4. Storage policies - Allow file deletion by owner or admin
CREATE POLICY storage_attachments_delete
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'attachments'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR user_has_role(auth.uid(), 'admin')
    )
);

-- 5. Verify bucket created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'attachments';
