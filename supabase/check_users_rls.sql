-- ============================================================
-- Check RLS policy cho bảng users
-- ============================================================

-- 1. Kiểm tra RLS có enabled không
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. Xem policies hiện tại
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 3. Nếu policy SELECT quá strict, fix lại
/*
DROP POLICY IF EXISTS "users_select" ON users;

-- Allow authenticated users to read all users
CREATE POLICY "users_select" ON users 
FOR SELECT 
TO authenticated
USING (true);

-- Verify
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'SELECT';
*/
