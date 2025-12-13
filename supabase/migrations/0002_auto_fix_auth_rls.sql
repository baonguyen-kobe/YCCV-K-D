-- ============================================================
-- AUTOMATED FIX SCRIPT
-- Run this entire script once to fix ALL auth/RLS issues
-- 
-- PREREQUISITE: Run 0001_full_schema.sql first
-- ============================================================

-- ============================================================
-- STEP 1: Fix RLS on users table
-- ============================================================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;

-- CREATE correct policies
CREATE POLICY "users_select" ON users 
FOR SELECT USING (true);

CREATE POLICY "users_insert" ON users 
FOR INSERT WITH CHECK (
  auth.uid() = id::UUID 
  OR 
  user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "users_update" ON users 
FOR UPDATE USING (
  id = auth.uid() OR user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "users_delete" ON users 
FOR DELETE USING (user_has_role(auth.uid(), 'admin'));

-- ============================================================
-- STEP 2: Fix RLS on user_roles table
-- ============================================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;

CREATE POLICY "user_roles_select" ON user_roles 
FOR SELECT USING (
  user_id = auth.uid() 
  OR 
  user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "user_roles_insert" ON user_roles 
FOR INSERT WITH CHECK (
  user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "user_roles_update" ON user_roles 
FOR UPDATE USING (
  user_has_role(auth.uid(), 'admin')
);

CREATE POLICY "user_roles_delete" ON user_roles 
FOR DELETE USING (
  user_has_role(auth.uid(), 'admin')
);

-- ============================================================
-- STEP 3: Fix RLS on roles table
-- ============================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select" ON roles;

CREATE POLICY "roles_select" ON roles 
FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- STEP 4: Ensure SECURITY DEFINER on helper functions
-- ============================================================

CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT) 
RETURNS BOOLEAN AS $$ 
BEGIN 
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = user_uuid AND r.name = role_name
  ); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_unit_id(user_uuid UUID) 
RETURNS UUID AS $$ 
DECLARE 
  unit UUID; 
BEGIN 
  SELECT unit_id INTO unit FROM users WHERE id = user_uuid; 
  RETURN unit; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 5: Create trigger for auto-assign role
-- ============================================================

CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role_id UUID;
BEGIN
    SELECT id INTO v_user_role_id FROM roles WHERE name = 'user' LIMIT 1;
    
    IF v_user_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.id, v_user_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_assign_role ON users;
CREATE TRIGGER on_user_created_assign_role
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_user_role();

-- ============================================================
-- STEP 6: Assign default role to existing users
-- ============================================================

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, (SELECT id FROM roles WHERE name = 'user' LIMIT 1)
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================
-- STEP 7: Clean up conflicting old policies
-- ============================================================

DROP POLICY IF EXISTS "Allow authenticated users to read requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to update requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to read request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to update request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to read request_comments" ON request_comments;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_comments" ON request_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read request_logs" ON request_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert request_logs" ON request_logs;

-- ============================================================
-- STEP 8: Verify the fix
-- ============================================================

-- Show users and their roles
SELECT 
    u.email,
    u.full_name,
    STRING_AGG(DISTINCT r.name, ', ' ORDER BY r.name) as roles,
    COUNT(DISTINCT r.id) as role_count
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id, u.email, u.full_name
ORDER BY u.email;

-- Verify user_has_role works
SELECT 
    u.email,
    user_has_role(u.id, 'user') as has_user_role,
    user_has_role(u.id, 'admin') as has_admin_role
FROM users u
ORDER BY u.email;

-- Show trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgrelid = 'public.users'::regclass
AND NOT tgisinternal;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If you see:
-- 1. All users with at least one role (role_count >= 1)
-- 2. user_has_role returns true for 'user' role
-- 3. Trigger 'on_user_created_assign_role' exists
-- 
-- Then the fix is COMPLETE! ✅
-- 
-- Next steps:
-- 1. Update your app code with new src/lib/auth/index.ts
-- 2. Test user signup and login
-- 3. Test creating requests
-- ============================================================
