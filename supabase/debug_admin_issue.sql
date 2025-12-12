-- ============================================================
-- DEBUG: Admin không thể tạo phiếu mới
-- Chạy các query này trong Supabase SQL Editor
-- ============================================================

-- 1. Kiểm tra tất cả users trong bảng public.users
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    u.created_at
FROM users u
ORDER BY u.created_at DESC;

-- 2. Kiểm tra tất cả roles đã được tạo
SELECT id, name, display_name, description 
FROM roles 
ORDER BY name;

-- 3. Kiểm tra user_roles mapping - XEM USER NÀO CÓ ROLE NÀO
SELECT 
    u.email,
    u.full_name,
    r.name as role_name,
    r.display_name
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
ORDER BY u.email, r.name;

-- 4. Kiểm tra xem admin có role không
SELECT 
    u.email,
    u.full_name,
    COUNT(ur.id) as role_count,
    STRING_AGG(r.name, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.id, u.email, u.full_name;

-- 5. Test user_has_role function
-- Thay user_id bằng ID thực tế của admin user
SELECT user_has_role(
    (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'), 
    'admin'
) as has_admin_role,
user_has_role(
    (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'), 
    'user'
) as has_user_role;

-- ============================================================
-- FIX: Thêm roles cho Admin user nếu thiếu
-- ============================================================

-- A. Lấy role IDs
-- SELECT id, name FROM roles;

-- B. Thêm role 'admin' cho user (nếu chưa có)
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 
--     (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'),
--     (SELECT id FROM roles WHERE name = 'admin')
-- ON CONFLICT (user_id, role_id) DO NOTHING;

-- C. Thêm role 'user' cho user (nếu chưa có - cần thiết để tạo phiếu)
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 
--     (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'),
--     (SELECT id FROM roles WHERE name = 'user')
-- ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- ALTERNATIVE FIX: Sửa RLS policy để admin không cần role 'user'
-- ============================================================

-- Hiện tại policy yêu cầu: admin OR manager OR user
-- Nhưng admin user có thể chỉ có role 'admin' mà không có 'user'

-- Kiểm tra policy hiện tại:
-- \d+ requests  -- trong psql

-- Nếu cần sửa policy:
-- DROP POLICY IF EXISTS requests_insert ON requests;
-- CREATE POLICY requests_insert ON requests FOR INSERT 
-- WITH CHECK (
--     user_has_role(auth.uid(), 'admin') OR 
--     user_has_role(auth.uid(), 'manager') OR 
--     user_has_role(auth.uid(), 'user')
-- );
