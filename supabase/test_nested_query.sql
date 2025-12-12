-- ============================================================
-- Test query giống như code đang chạy
-- ============================================================

-- Query này GIỐNG HỆT code trong getCurrentUserWithRoles()
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.unit_id,
    json_agg(
        json_build_object('role', json_build_object('name', r.name))
    ) as user_roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.id = '1c7a37ed-b122-479b-a361-8fc38c8b39be'
GROUP BY u.id, u.email, u.full_name, u.unit_id;

-- Kết quả mong muốn: 
-- user_roles: [{"role":{"name":"admin"}}, {"role":{"name":"user"}}]

-- Nếu query này trả về NULL hoặc empty, có nghĩa là RLS block
