-- ============================================================
-- FIX: Sync user từ auth.users sang public.users
-- ============================================================

-- 1. Kiểm tra user trong auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE id = '1c7a37ed-b122-479b-a361-8fc38c8b39be';

-- 2. Kiểm tra user trong public.users
SELECT * FROM public.users
WHERE id = '1c7a37ed-b122-479b-a361-8fc38c8b39be';

-- 3. Nếu không có trong public.users, thêm vào
INSERT INTO public.users (
    id,
    email,
    full_name,
    is_active,
    unit_id
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    true,
    '00000000-0000-0000-0000-000000000001' -- Khoa Điều dưỡng
FROM auth.users au
WHERE au.id = '1c7a37ed-b122-479b-a361-8fc38c8b39be'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
  )
RETURNING *;

-- 4. Thêm roles (admin và user)
INSERT INTO user_roles (user_id, role_id)
SELECT 
    '1c7a37ed-b122-479b-a361-8fc38c8b39be',
    r.id
FROM roles r
WHERE r.name IN ('admin', 'user')
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = '1c7a37ed-b122-479b-a361-8fc38c8b39be'
      AND ur.role_id = r.id
  )
RETURNING *;

-- 5. Verify
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    u.unit_id,
    un.name as unit_name,
    ARRAY_AGG(r.name ORDER BY r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN units un ON un.id = u.unit_id
WHERE u.id = '1c7a37ed-b122-479b-a361-8fc38c8b39be'
GROUP BY u.id, u.email, u.full_name, u.is_active, u.unit_id, un.name;
