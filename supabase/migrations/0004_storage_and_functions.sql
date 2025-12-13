-- ============================================================
-- YCCV Migration 0004: Storage Buckets & Search Functions
-- Consolidates: setup_storage.sql, avatar_storage.sql, search_function.sql
-- ============================================================
-- 
-- RUN ORDER:
-- 1. 0001_full_schema.sql - Main schema
-- 2. 0002_auto_fix_auth_rls.sql - Auth & RLS fixes  
-- 3. 0003_debug_auth_rls.sql - Diagnostics (optional)
-- 4. THIS FILE - Storage & search functions
--
-- If bucket creation fails with permission errors, use Supabase Dashboard.
-- ============================================================

-- ============================================================
-- PART 1: ATTACHMENTS STORAGE BUCKET
-- ============================================================

-- Create storage bucket for file attachments
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

-- Storage policies for attachments
CREATE POLICY IF NOT EXISTS storage_attachments_insert
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY IF NOT EXISTS storage_attachments_select
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'attachments' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
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

CREATE POLICY IF NOT EXISTS storage_attachments_delete
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'attachments'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR user_has_role(auth.uid(), 'admin')
    )
);

-- ============================================================
-- PART 2: AVATARS STORAGE BUCKET
-- ============================================================

-- Create avatars bucket (public for direct URL access)
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

-- Drop existing avatar policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Avatar storage policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = split_part(name, '-', 1)
);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================
-- PART 3: SEARCH FUNCTION
-- ============================================================

-- Full-text search across requests and items
CREATE OR REPLACE FUNCTION search_requests(
    p_search_query TEXT,
    p_user_id UUID,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_is_manager BOOLEAN DEFAULT FALSE,
    p_is_staff BOOLEAN DEFAULT FALSE,
    p_user_unit_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    request_number INTEGER,
    reason TEXT,
    priority priority_level,
    status request_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    assignee_id UUID,
    unit_id UUID,
    creator_name TEXT,
    creator_email TEXT,
    assignee_name TEXT,
    assignee_email TEXT,
    matched_items TEXT[],
    total_count BIGINT
) AS $$
DECLARE
    v_search_pattern TEXT;
    v_total BIGINT;
BEGIN
    v_search_pattern := '%' || LOWER(COALESCE(p_search_query, '')) || '%';
    
    SELECT COUNT(DISTINCT r.id) INTO v_total
    FROM requests r
    LEFT JOIN request_items ri ON ri.request_id = r.id
    WHERE (
        LOWER(r.reason) LIKE v_search_pattern
        OR r.request_number::TEXT LIKE v_search_pattern
        OR LOWER(ri.item_name) LIKE v_search_pattern
        OR NULLIF(TRIM(p_search_query), '') IS NULL
    )
    AND (
        p_is_admin = TRUE
        OR (p_is_manager = TRUE AND r.unit_id = p_user_unit_id)
        OR (p_is_staff = TRUE AND r.assignee_id = p_user_id)
        OR r.created_by = p_user_id
    )
    AND (p_status IS NULL OR r.status::TEXT = p_status)
    AND (p_priority IS NULL OR r.priority::TEXT = p_priority);
    
    RETURN QUERY
    SELECT 
        r.id,
        r.request_number,
        r.reason,
        r.priority,
        r.status,
        r.created_at,
        r.updated_at,
        r.created_by,
        r.assignee_id,
        r.unit_id,
        creator.full_name AS creator_name,
        creator.email AS creator_email,
        assignee.full_name AS assignee_name,
        assignee.email AS assignee_email,
        ARRAY_AGG(DISTINCT ri.item_name) FILTER (WHERE LOWER(ri.item_name) LIKE v_search_pattern) AS matched_items,
        v_total AS total_count
    FROM requests r
    LEFT JOIN users creator ON creator.id = r.created_by
    LEFT JOIN users assignee ON assignee.id = r.assignee_id
    LEFT JOIN request_items ri ON ri.request_id = r.id
    WHERE (
        LOWER(r.reason) LIKE v_search_pattern
        OR r.request_number::TEXT LIKE v_search_pattern
        OR LOWER(ri.item_name) LIKE v_search_pattern
        OR NULLIF(TRIM(p_search_query), '') IS NULL
    )
    AND (
        p_is_admin = TRUE
        OR (p_is_manager = TRUE AND r.unit_id = p_user_unit_id)
        OR (p_is_staff = TRUE AND r.assignee_id = p_user_id)
        OR r.created_by = p_user_id
    )
    AND (p_status IS NULL OR r.status::TEXT = p_status)
    AND (p_priority IS NULL OR r.priority::TEXT = p_priority)
    GROUP BY r.id, r.request_number, r.reason, r.priority, r.status, 
             r.created_at, r.updated_at, r.created_by, r.assignee_id, r.unit_id,
             creator.full_name, creator.email, assignee.full_name, assignee.email
    ORDER BY r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Storage buckets:' as check_type;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('attachments', 'avatars');

SELECT 'Search function:' as check_type;
SELECT proname FROM pg_proc WHERE proname = 'search_requests';
