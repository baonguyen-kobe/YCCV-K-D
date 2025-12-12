-- ============================================================
-- TEST INSERT REQUEST - Xem lỗi chi tiết khi INSERT trực tiếp
-- Chạy từng query để debug
-- ============================================================

-- 1. Kiểm tra thông tin user
SELECT 
    u.id,
    u.email,
    u.unit_id,
    u.is_active,
    un.name as unit_name,
    ARRAY_AGG(r.name ORDER BY r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN units un ON un.id = u.unit_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.id, u.email, u.unit_id, u.is_active, un.name;

-- 2. Test user_has_role function
SELECT 
    user_has_role(auth.uid(), 'admin') as has_admin,
    user_has_role(auth.uid(), 'manager') as has_manager,
    user_has_role(auth.uid(), 'user') as has_user,
    auth.uid() as current_auth_uid;

-- 3. Xem policy INSERT hiện tại
SELECT 
    policyname,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';

-- 4. TEST INSERT TRỰC TIẾP (giống như app code)
-- Uncomment để test
/*
DO $$
DECLARE
    v_user_id UUID;
    v_unit_id UUID;
    v_unit_name TEXT;
    v_request_id UUID;
BEGIN
    -- Get current user info
    SELECT id, unit_id INTO v_user_id, v_unit_id
    FROM users WHERE id = auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', auth.uid();
    END IF;
    
    SELECT name INTO v_unit_name FROM units WHERE id = v_unit_id;
    
    RAISE NOTICE 'Attempting INSERT with:';
    RAISE NOTICE '  User ID: %', v_user_id;
    RAISE NOTICE '  Unit ID: %', v_unit_id;
    RAISE NOTICE '  Unit Name: %', v_unit_name;
    RAISE NOTICE '  Has admin role: %', user_has_role(auth.uid(), 'admin');
    RAISE NOTICE '  Has user role: %', user_has_role(auth.uid(), 'user');
    
    -- Try the actual INSERT that the app does
    INSERT INTO requests (
        reason,
        priority,
        status,
        unit_id,
        unit_name_snapshot,
        created_by
    ) VALUES (
        'Test từ SQL',
        'NORMAL',
        'DRAFT',
        v_unit_id,
        v_unit_name,
        v_user_id
    ) RETURNING id INTO v_request_id;
    
    RAISE NOTICE 'SUCCESS! Request created: %', v_request_id;
    
    -- Rollback to not create real request
    RAISE EXCEPTION 'Test successful - rolling back to prevent actual creation';
    
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Test successful%' THEN
            RAISE NOTICE 'Test completed successfully';
        ELSE
            RAISE NOTICE 'ERROR: %', SQLERRM;
            RAISE NOTICE 'DETAIL: %', SQLSTATE;
        END IF;
        -- Re-raise to see full error
        RAISE;
END $$;
*/

-- ============================================================
-- GIẢI PHÁP: Nếu WITH CHECK fail
-- ============================================================
/*
-- Xem policy hiện tại
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'requests' AND cmd = 'INSERT';

-- Nếu WITH CHECK có vấn đề, drop và tạo lại
DROP POLICY IF EXISTS "requests_insert" ON requests;

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

-- Verify
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'requests' AND cmd = 'INSERT';
*/
