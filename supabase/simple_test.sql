-- ============================================================
-- SIMPLE TEST - Từng bước một
-- ============================================================

-- STEP 1: Kiểm tra policy cho requests INSERT
SELECT 
    policyname,
    cmd,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'requests' 
  AND cmd = 'INSERT';

-- STEP 2: Test user roles
SELECT 
    auth.uid() as my_user_id,
    user_has_role(auth.uid(), 'admin') as has_admin,
    user_has_role(auth.uid(), 'user') as has_user,
    user_has_role(auth.uid(), 'manager') as has_manager;

-- STEP 3: Test INSERT vào requests (KHÔNG có request_items)
-- Uncomment để test
/*
INSERT INTO requests (
    reason,
    priority,
    status,
    unit_id,
    unit_name_snapshot,
    created_by
)
SELECT 
    'Test từ SQL - chỉ requests',
    'NORMAL',
    'DRAFT',
    u.unit_id,
    (SELECT name FROM units WHERE id = u.unit_id),
    auth.uid()
FROM users u
WHERE u.id = auth.uid()
RETURNING id, request_number, created_by, status;
*/

-- Nếu STEP 3 fail:
-- - Chạy fix_insert_policy.sql
-- - Hoặc chạy đoạn fix dưới đây

-- ============================================================
-- FIX NHANH - Chạy nếu STEP 3 fail
-- ============================================================
/*
-- Drop tất cả policies INSERT cũ
DROP POLICY IF EXISTS "requests_insert" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON requests;

-- Tạo policy mới đơn giản
CREATE POLICY "requests_insert" ON requests 
FOR INSERT 
TO authenticated
WITH CHECK (
    created_by = auth.uid()
    AND (
        user_has_role(auth.uid(), 'admin'::text) 
        OR user_has_role(auth.uid(), 'manager'::text) 
        OR user_has_role(auth.uid(), 'user'::text)
    )
);

-- Verify lại
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'requests' AND cmd = 'INSERT';
*/
