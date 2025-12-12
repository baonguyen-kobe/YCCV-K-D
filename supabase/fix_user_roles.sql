-- ============================================================
-- FIX: Auto-assign default 'user' role when new user is created
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create trigger function to auto-assign 'user' role
CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role_id UUID;
BEGIN
    -- Get the 'user' role ID
    SELECT id INTO v_user_role_id FROM roles WHERE name = 'user';
    
    -- If 'user' role exists, assign it to the new user
    IF v_user_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.id, v_user_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on users table
DROP TRIGGER IF EXISTS on_user_created_assign_role ON users;
CREATE TRIGGER on_user_created_assign_role
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_user_role();

-- 3. Fix existing users who don't have any roles
-- This adds 'user' role to all existing users who don't have it
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'user'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- 4. Verify all users now have at least 'user' role
SELECT 
    u.email,
    u.full_name,
    STRING_AGG(r.name, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id, u.email, u.full_name
ORDER BY u.email;

-- 5. Add 'admin' role to specific user (for testing)
-- Uncomment and modify email as needed
/*
INSERT INTO user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM users WHERE email = 'bao.nguyen@eiu.edu.vn'),
    (SELECT id FROM roles WHERE name = 'admin')
ON CONFLICT (user_id, role_id) DO NOTHING;
*/

-- ============================================================
-- VERIFY FIX
-- ============================================================

-- Test that user_has_role works correctly
SELECT 
    u.email,
    user_has_role(u.id, 'user') as has_user_role,
    user_has_role(u.id, 'admin') as has_admin_role,
    user_has_role(u.id, 'manager') as has_manager_role,
    user_has_role(u.id, 'staff') as has_staff_role
FROM users u
ORDER BY u.email;
