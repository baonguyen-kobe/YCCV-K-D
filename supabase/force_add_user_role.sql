-- ============================================================
-- FIX: Force add 'user' role nếu chưa có
-- ============================================================

-- 1. Kiểm tra roles hiện tại
SELECT 
    u.email,
    ARRAY_AGG(r.name ORDER BY r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.email;

-- 2. Thêm role 'user' nếu chưa có
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
  AND r.name = 'user'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = u.id AND ur2.role_id = r.id
  )
RETURNING *;

-- 3. Verify lại
SELECT 
    u.email,
    ARRAY_AGG(r.name ORDER BY r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'bao.nguyen@eiu.edu.vn'
GROUP BY u.email;

-- Kết quả mong muốn: {admin, user}
