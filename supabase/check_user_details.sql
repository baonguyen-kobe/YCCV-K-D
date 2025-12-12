-- ============================================================
-- KIỂM TRA CHI TIẾT USER - Tại sao không có quyền tạo phiếu?
-- ============================================================

-- 1. Kiểm tra TẤT CẢ thông tin user
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    u.unit_id,
    u.created_at,
    un.name as unit_name,
    ARRAY_AGG(r.name ORDER BY r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN units un ON un.id = u.unit_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'  -- Email của bạn
GROUP BY u.id, u.email, u.full_name, u.is_active, u.unit_id, u.created_at, un.name;

-- 2. Kiểm tra unit có tồn tại không
SELECT * FROM units ORDER BY name;

-- 3. Test các permission functions
SELECT 
    user_has_role(
        (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'),
        'admin'
    ) as has_admin,
    user_has_role(
        (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'),
        'user'
    ) as has_user;

-- 4. Kiểm tra RLS policy cho INSERT requests
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'requests' 
  AND cmd = 'INSERT';

-- ============================================================
-- GIẢI PHÁP: Nếu user.unit_id = NULL
-- ============================================================
/*
-- Cập nhật unit_id cho user (chọn unit từ list ở query #2)
UPDATE users 
SET unit_id = 'UNIT-ID-HERE'  -- Thay bằng unit_id thực
WHERE email = 'bao.nguyen@eiu.edu.vn';

-- Kiểm tra lại
SELECT email, full_name, unit_id, (SELECT name FROM units WHERE id = users.unit_id) as unit_name
FROM users 
WHERE email = 'bao.nguyen@eiu.edu.vn';
*/

-- ============================================================
-- TEST TẠO REQUEST (để xem lỗi gì)
-- ============================================================
/*
INSERT INTO requests (
    request_number,
    reason,
    priority,
    status,
    created_by,
    unit_id,
    unit_name_snapshot
)
SELECT 
    (SELECT COALESCE(MAX(request_number), 0) + 1 FROM requests),
    'Test request from admin',
    'NORMAL',
    'DRAFT',
    u.id,
    u.unit_id,
    (SELECT name FROM units WHERE id = u.unit_id)
FROM users u
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
RETURNING id, request_number, status, created_by, unit_id;
*/
