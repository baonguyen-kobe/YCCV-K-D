-- ============================================================
-- Fix RLS Policies
-- ============================================================
-- This script fixes RLS policy issues that may prevent authenticated users
-- from creating requests even when they have the correct roles.
--
-- Run this script in Supabase SQL Editor AFTER 0001_full_schema.sql

-- ============================================================
-- STEP 1: Verify user_has_role function exists and works
-- ============================================================

-- Drop and recreate the function to ensure it's correct
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT) 
RETURNS BOOLEAN AS $$ 
BEGIN 
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = user_uuid AND r.name = role_name
  ); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 2: Drop all conflicting policies on requests table
-- ============================================================

-- Drop policies from 0001_full_schema.sql
DROP POLICY IF EXISTS "requests_select" ON requests;
DROP POLICY IF EXISTS "requests_insert" ON requests;
DROP POLICY IF EXISTS "requests_update" ON requests;
DROP POLICY IF EXISTS "requests_delete" ON requests;

-- Drop policies from enable_rls_authenticated.sql
DROP POLICY IF EXISTS "Allow authenticated users to read requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to update requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete requests" ON requests;

-- ============================================================
-- STEP 3: Create correct RLS policies for requests
-- ============================================================

-- SELECT: Based on role and ownership
CREATE POLICY "requests_select" ON requests 
FOR SELECT USING (
  user_has_role(auth.uid(), 'admin') 
  OR (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid())) 
  OR (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid()) 
  OR created_by = auth.uid()
);

-- INSERT: Admin, Manager, or User can create
-- Note: We check if user has ANY of these roles
CREATE POLICY "requests_insert" ON requests 
FOR INSERT WITH CHECK (
  user_has_role(auth.uid(), 'admin') 
  OR user_has_role(auth.uid(), 'manager') 
  OR user_has_role(auth.uid(), 'user')
);

-- UPDATE: Based on role, ownership, and status
CREATE POLICY "requests_update" ON requests 
FOR UPDATE USING (
  user_has_role(auth.uid(), 'admin') 
  OR (created_by = auth.uid() AND status = 'DRAFT') 
  OR (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid())) 
  OR (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid())
);

-- DELETE: Only Admin
CREATE POLICY "requests_delete" ON requests 
FOR DELETE USING (user_has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 4: Fix request_items policies
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "request_items_select" ON request_items;
DROP POLICY IF EXISTS "request_items_insert" ON request_items;
DROP POLICY IF EXISTS "request_items_update" ON request_items;
DROP POLICY IF EXISTS "request_items_delete" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to read request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to update request_items" ON request_items;

-- Recreate with correct logic
CREATE POLICY "request_items_select" ON request_items 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_items.request_id)
);

-- Allow insert if user can view the parent request
CREATE POLICY "request_items_insert" ON request_items 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (
      r.created_by = auth.uid() 
      OR user_has_role(auth.uid(), 'admin')
      OR user_has_role(auth.uid(), 'manager')
    )
  )
);

CREATE POLICY "request_items_update" ON request_items 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (
      user_has_role(auth.uid(), 'admin') 
      OR (r.created_by = auth.uid() AND r.status = 'DRAFT')
    )
  )
);

CREATE POLICY "request_items_delete" ON request_items 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (
      user_has_role(auth.uid(), 'admin') 
      OR (r.created_by = auth.uid() AND r.status = 'DRAFT')
    )
  )
);

-- ============================================================
-- STEP 5: Fix request_logs policies
-- ============================================================

DROP POLICY IF EXISTS "request_logs_select" ON request_logs;
DROP POLICY IF EXISTS "request_logs_insert" ON request_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read request_logs" ON request_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_logs" ON request_logs;

CREATE POLICY "request_logs_select" ON request_logs 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_logs.request_id)
);

-- Allow any authenticated user to insert logs (the action validation is done in app)
CREATE POLICY "request_logs_insert" ON request_logs 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STEP 6: Fix request_comments policies  
-- ============================================================

DROP POLICY IF EXISTS "request_comments_select" ON request_comments;
DROP POLICY IF EXISTS "request_comments_insert" ON request_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read request_comments" ON request_comments;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_comments" ON request_comments;

CREATE POLICY "request_comments_select" ON request_comments 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_comments.request_id) 
  AND (
    is_internal = false 
    OR user_has_role(auth.uid(), 'admin') 
    OR user_has_role(auth.uid(), 'manager') 
    OR user_has_role(auth.uid(), 'staff')
  )
);

CREATE POLICY "request_comments_insert" ON request_comments 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_comments.request_id) 
  AND user_id = auth.uid() 
  AND (
    is_internal = false 
    OR user_has_role(auth.uid(), 'admin') 
    OR user_has_role(auth.uid(), 'manager') 
    OR user_has_role(auth.uid(), 'staff')
  )
);

-- ============================================================
-- STEP 7: Fix attachments policies
-- ============================================================

DROP POLICY IF EXISTS "attachments_select" ON attachments;
DROP POLICY IF EXISTS "attachments_insert" ON attachments;
DROP POLICY IF EXISTS "attachments_delete" ON attachments;
DROP POLICY IF EXISTS "Allow authenticated users to read attachments" ON attachments;
DROP POLICY IF EXISTS "Allow authenticated users to insert attachments" ON attachments;

CREATE POLICY "attachments_select" ON attachments 
FOR SELECT USING (
  request_id IS NULL 
  OR EXISTS (SELECT 1 FROM requests r WHERE r.id = attachments.request_id)
);

CREATE POLICY "attachments_insert" ON attachments 
FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "attachments_delete" ON attachments 
FOR DELETE USING (
  user_has_role(auth.uid(), 'admin') 
  OR uploaded_by = auth.uid()
);

-- ============================================================
-- STEP 8: Ensure rate_limits policies are correct
-- ============================================================

DROP POLICY IF EXISTS "rate_limits_select" ON rate_limits;
DROP POLICY IF EXISTS "rate_limits_insert" ON rate_limits;
DROP POLICY IF EXISTS "rate_limits_update" ON rate_limits;
DROP POLICY IF EXISTS "Allow authenticated users to read rate_limits" ON rate_limits;
DROP POLICY IF EXISTS "Allow authenticated users to insert rate_limits" ON rate_limits;

CREATE POLICY "rate_limits_select" ON rate_limits 
FOR SELECT USING (
  user_id = auth.uid() OR user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "rate_limits_insert" ON rate_limits 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "rate_limits_update" ON rate_limits 
FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- STEP 9: Verify by testing (run these queries to test)
-- ============================================================

-- Test user_has_role function works:
-- SELECT user_has_role('your-user-id-here', 'admin');
-- SELECT user_has_role('your-user-id-here', 'user');

-- Check what roles a user has:
-- SELECT u.email, r.name as role 
-- FROM users u 
-- JOIN user_roles ur ON u.id = ur.user_id 
-- JOIN roles r ON ur.role_id = r.id 
-- WHERE u.email = 'your-email@example.com';

-- ============================================================
-- DONE!
-- ============================================================
