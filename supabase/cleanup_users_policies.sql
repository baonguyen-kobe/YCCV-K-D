-- ============================================================
-- FIX: Clean up duplicate SELECT policies
-- ============================================================

-- Drop old policy
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;

-- Keep only users_select with USING (true)
-- Already exists, no need to recreate

-- Verify - should only see users_select
SELECT 
    policyname,
    cmd,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'SELECT'
ORDER BY policyname;

-- Expected result: Only "users_select" with using_expression = true
