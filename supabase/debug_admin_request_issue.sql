-- ============================================================
-- DEBUG: Tại sao Admin không tạo được phiếu yêu cầu?
-- Chạy từng query để tìm nguyên nhân
-- ============================================================

-- 1. Kiểm tra user hiện tại và roles
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    ARRAY_AGG(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.id = auth.uid()  -- Thay bằng user ID của bạn nếu cần
GROUP BY u.id, u.email, u.full_name, u.is_active;

-- 2. Kiểm tra xem có role 'user' không?
SELECT 
    u.email,
    r.name as role_name
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.id = auth.uid()
ORDER BY r.name;

-- 3. Kiểm tra RLS policies trên bảng requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'requests'
ORDER BY policyname;

-- 4. Kiểm tra RLS policies trên bảng request_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'request_items'
ORDER BY policyname;

-- 5. Test user_has_role function
SELECT 
    user_has_role(auth.uid(), 'admin') as has_admin,
    user_has_role(auth.uid(), 'user') as has_user,
    user_has_role(auth.uid(), 'manager') as has_manager,
    user_has_role(auth.uid(), 'staff') as has_staff;

-- 6. Kiểm tra xem có thể SELECT từ requests không?
SELECT COUNT(*) as total_requests FROM requests;

-- 7. Thử INSERT trực tiếp (sẽ fail nếu có vấn đề)
-- UNCOMMENT để test (nhớ thay unit_id):
/*
INSERT INTO requests (
    request_number,
    reason,
    priority,
    status,
    created_by,
    unit_id,
    unit_name_snapshot
) VALUES (
    9999,
    'Test request from admin',
    'NORMAL',
    'DRAFT',
    auth.uid(),
    'YOUR-UNIT-ID-HERE',
    'Test Unit'
) RETURNING id, request_number, status;
*/

-- ============================================================
-- GIẢI PHÁP NHANH:
-- Nếu thiếu role 'user', chạy lệnh này (thay email):
-- ============================================================
/*
-- Thêm role 'user' cho admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'your-email@example.com'  -- Thay email của bạn
  AND r.name = 'user'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = u.id AND ur2.role_id = r.id
  );

-- Kiểm tra lại
SELECT u.email, ARRAY_AGG(r.name) as roles
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@example.com'
GROUP BY u.email;
*/
