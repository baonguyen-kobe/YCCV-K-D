-- ============================================================
-- DEBUG & DIAGNOSTIC SCRIPT
-- Run this to diagnose authentication/RLS issues
-- ============================================================

-- ============================================================
-- 1. Check if RLS is enabled on critical tables
-- ============================================================
SELECT 
    schemaname,
    tablename,
    (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'user_roles', 'roles', 'requests')
ORDER BY tablename;

-- ============================================================
-- 2. Check all RLS policies on users table
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual as "USING condition",
    with_check as "WITH CHECK condition"
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================================
-- 3. Check all RLS policies on user_roles table
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual as "USING condition",
    with_check as "WITH CHECK condition"
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- ============================================================
-- 4. Check helper functions exist and have SECURITY DEFINER
-- ============================================================
SELECT 
    p.proname,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE proname IN ('user_has_role', 'get_user_unit_id', 'assign_default_user_role')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================================
-- 5. Check trigger exists on users table
-- ============================================================
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'users')
    AND NOT tgisinternal
ORDER BY tgname;

-- ============================================================
-- 6. List all users and their roles
-- ============================================================
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.unit_id,
    u.is_active,
    STRING_AGG(DISTINCT r.name, ', ' ORDER BY r.name) as roles,
    COUNT(DISTINCT ur.id) as role_count,
    u.created_at
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id, u.email, u.full_name, u.unit_id, u.is_active, u.created_at
ORDER BY u.email;

-- ============================================================
-- 7. Check for orphaned auth.users (in auth but not in public.users)
-- ============================================================
SELECT 
    au.id,
    au.email,
    CASE 
        WHEN pu.id IS NULL THEN 'MISSING from public.users'
        ELSE 'EXISTS in public.users'
    END as status,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE au.deleted_at IS NULL
ORDER BY au.email;

-- ============================================================
-- 8. Test user_has_role function for each user
-- ============================================================
SELECT 
    u.email,
    user_has_role(u.id, 'admin') as is_admin,
    user_has_role(u.id, 'manager') as is_manager,
    user_has_role(u.id, 'staff') as is_staff,
    user_has_role(u.id, 'user') as is_user
FROM users u
ORDER BY u.email;

-- ============================================================
-- 9. Check rate_limits table status
-- ============================================================
SELECT 
    COUNT(*) as total_limits,
    COUNT(DISTINCT user_id) as users_with_limits,
    COUNT(DISTINCT action) as unique_actions
FROM rate_limits;

-- ============================================================
-- 10. Check if roles table has all required roles
-- ============================================================
SELECT 
    id,
    name,
    display_name,
    description,
    created_at
FROM roles
ORDER BY name;

-- ============================================================
-- 11. Detailed user profile info (for specific user)
-- ============================================================
-- Replace 'bao.nguyen@eiu.edu.vn' with actual email
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.unit_id,
    u.phone,
    u.is_active,
    u.created_at,
    u.updated_at,
    json_agg(
        json_build_object(
            'role_id', r.id,
            'role_name', r.name,
            'display_name', r.display_name,
            'assigned_at', ur.assigned_at
        )
    ) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.id, u.email, u.full_name, u.unit_id, u.phone, u.is_active, u.created_at, u.updated_at;

-- ============================================================
-- 12. Check request policies
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    qual as "USING condition",
    with_check as "WITH CHECK condition"
FROM pg_policies 
WHERE tablename = 'requests'
ORDER BY policyname;

-- ============================================================
-- 13. Count requests by status and creator
-- ============================================================
SELECT 
    r.status,
    COUNT(*) as count,
    COUNT(DISTINCT r.created_by) as unique_creators
FROM requests r
GROUP BY r.status
ORDER BY r.status;

-- ============================================================
-- 14. Find requests that might have permission issues
-- ============================================================
SELECT 
    r.id,
    r.request_number,
    r.reason,
    r.status,
    u.email as created_by_email,
    r.created_at
FROM requests r
LEFT JOIN users u ON u.id = r.created_by
ORDER BY r.created_at DESC
LIMIT 20;

-- ============================================================
-- MANUAL FIXES (if needed)
-- ============================================================

-- Fix 1: Manually assign admin role to a user
/*
INSERT INTO user_roles (user_id, role_id)
SELECT 
    u.id,
    r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
    AND r.name = 'admin'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = u.id AND ur.role_id = r.id
    );
*/

-- Fix 2: Ensure all users have at least 'user' role
/*
WITH user_role AS (SELECT id FROM roles WHERE name = 'user')
INSERT INTO user_roles (user_id, role_id)
SELECT DISTINCT u.id, user_role.id
FROM users u
CROSS JOIN user_role
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = user_role.id
);
*/

-- Fix 3: Check and fix is_active flag for users
/*
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;
*/

-- ============================================================
-- PERFORMANCE CHECK
-- ============================================================

-- Check if indexes exist for common queries
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_roles', 'requests')
ORDER BY tablename, indexname;

-- ============================================================
-- POLICY EFFECTIVENESS TEST
-- ============================================================
-- This can be run as a test user to verify RLS works correctly
-- Set role to authenticated user:
-- SET ROLE <user_email>;
-- Then run:
-- SELECT COUNT(*) FROM users;  -- Should return users they have access to
-- SELECT COUNT(*) FROM requests;  -- Should return requests they have access to

