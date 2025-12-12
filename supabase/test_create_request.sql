-- ============================================================
-- TEST TẠO REQUEST - Xem lỗi chi tiết
-- ============================================================

-- 1. Kiểm tra thông tin user đầy đủ
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.unit_id,
    u.is_active,
    un.name as unit_name,
    ARRAY_AGG(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN units un ON un.id = u.unit_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.id, u.email, u.full_name, u.unit_id, u.is_active, un.name;

-- 2. Test user_has_role function
SELECT 
    auth.uid() as current_user_id,
    user_has_role(auth.uid(), 'admin') as has_admin,
    user_has_role(auth.uid(), 'user') as has_user;

-- 3. Kiểm tra RLS policies cho requests INSERT
SELECT 
    policyname,
    cmd,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'requests' 
  AND cmd = 'INSERT';

-- 4. Kiểm tra RLS policies cho request_items INSERT  
SELECT 
    policyname,
    cmd,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'request_items' 
  AND cmd = 'INSERT';

-- ============================================================
-- TEST TRỰC TIẾP - Uncomment để test
-- Nếu fail, sẽ hiện lỗi chi tiết
-- ============================================================
/*
DO $$
DECLARE
    v_user_id UUID;
    v_unit_id UUID;
    v_unit_name TEXT;
    v_request_id UUID;
    v_request_number INT;
BEGIN
    -- Get user info
    SELECT id, unit_id INTO v_user_id, v_unit_id
    FROM users WHERE email = 'bao.nguyen@eiu.edu.vn';
    
    SELECT name INTO v_unit_name FROM units WHERE id = v_unit_id;
    
    -- Get next request number
    SELECT COALESCE(MAX(request_number), 0) + 1 INTO v_request_number FROM requests;
    
    RAISE NOTICE 'User ID: %, Unit ID: %, Unit Name: %, Request Number: %', 
                 v_user_id, v_unit_id, v_unit_name, v_request_number;
    
    -- Try INSERT
    INSERT INTO requests (
        request_number,
        reason,
        priority,
        status,
        created_by,
        unit_id,
        unit_name_snapshot
    ) VALUES (
        v_request_number,
        'Test request from SQL',
        'NORMAL',
        'DRAFT',
        v_user_id,
        v_unit_id,
        v_unit_name
    ) RETURNING id INTO v_request_id;
    
    RAISE NOTICE 'Request created successfully! ID: %', v_request_id;
    
    -- Rollback để không tạo request thật
    RAISE EXCEPTION 'Test completed - rolling back';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE;
END $$;
*/

-- ============================================================
-- FIX: Nếu RLS policies sai, chạy lại fix_rls_policies.sql
-- hoặc chạy đoạn này để sửa nhanh
-- ============================================================
/*
-- Drop old policies
DROP POLICY IF EXISTS "requests_insert" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;

-- Create correct INSERT policy
CREATE POLICY "requests_insert" ON requests
FOR INSERT
TO authenticated
WITH CHECK (
    user_has_role(auth.uid(), 'admin'::text) 
    OR user_has_role(auth.uid(), 'manager'::text)
    OR user_has_role(auth.uid(), 'user'::text)
);

-- Verify
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';
*/
