-- ============================================================
-- COMPLETE AUTH SETUP WITH KNOWN PASSWORDS
-- ============================================================
-- Run this script in Supabase SQL Editor after migration
-- This creates both auth.users and public.users with correct mappings

-- ============================================================
-- 1. CREATE AUTH USERS (with encrypted passwords)
-- ============================================================

-- Insert into auth.users
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token,
  raw_app_meta_data, raw_user_meta_data
)
VALUES
  -- Admin: admin@eiu.edu.vn / Admin@123
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin@eiu.edu.vn',
   crypt('Admin@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Manager 1: manager01@eiu.edu.vn / Manager@123
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager01@eiu.edu.vn',
   crypt('Manager@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Manager 2: manager02@eiu.edu.vn / Manager@123
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager02@eiu.edu.vn',
   crypt('Manager@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Staff 1: staff01@eiu.edu.vn / Staff@123
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff01@eiu.edu.vn',
   crypt('Staff@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Staff 2: staff02@eiu.edu.vn / Staff@123
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff02@eiu.edu.vn',
   crypt('Staff@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Lecturer 1: lecturer01@eiu.edu.vn / User@123
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer01@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Lecturer 2: lecturer02@eiu.edu.vn / User@123
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer02@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Lecturer 3: lecturer03@eiu.edu.vn / User@123
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer03@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}'),

  -- Multi-role: multiuser@eiu.edu.vn / Multi@123
  ('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'multiuser@eiu.edu.vn',
   crypt('Multi@123', gen_salt('bf')), NOW(), NOW(), NOW(),
   '', '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{}')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. CREATE IDENTITIES (required for auth)
-- ============================================================

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  id, id, 
  jsonb_build_object('sub', id::text, 'email', email),
  'email', id::text,
  NOW(), NOW(), NOW()
FROM auth.users
WHERE email LIKE '%@eiu.edu.vn'
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ============================================================
-- 3. CREATE PUBLIC USERS (profiles)
-- ============================================================

INSERT INTO public.users (id, email, full_name, phone, unit_id, is_active)
VALUES 
  ('00000000-0000-0000-0001-000000000001', 'admin@eiu.edu.vn', 'Nguyễn Admin', '0901000001', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000002', 'manager01@eiu.edu.vn', 'Trần Quản Lý', '0901000002', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000003', 'manager02@eiu.edu.vn', 'Phạm Quản Lý', '0901000003', '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000004', 'staff01@eiu.edu.vn', 'Lê Chuyên Viên', '0901000004', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000005', 'staff02@eiu.edu.vn', 'Hoàng Chuyên Viên', '0901000005', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000006', 'lecturer01@eiu.edu.vn', 'Võ Giảng Viên', '0901000006', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000007', 'lecturer02@eiu.edu.vn', 'Đặng Giảng Viên', '0901000007', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000008', 'lecturer03@eiu.edu.vn', 'Bùi Trợ Giảng', '0901000008', '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000009', 'multiuser@eiu.edu.vn', 'Ngô Đa Vai', '0901000009', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. ASSIGN ROLES
-- ============================================================

DO $$
DECLARE
  role_admin UUID;
  role_manager UUID;
  role_staff UUID;
  role_user UUID;
BEGIN
  SELECT id INTO role_admin FROM roles WHERE name = 'admin';
  SELECT id INTO role_manager FROM roles WHERE name = 'manager';
  SELECT id INTO role_staff FROM roles WHERE name = 'staff';
  SELECT id INTO role_user FROM roles WHERE name = 'user';

  -- Admin
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000001', role_admin)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Managers
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000002', role_manager),
    ('00000000-0000-0000-0001-000000000003', role_manager)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Staff
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000004', role_staff),
    ('00000000-0000-0000-0001-000000000005', role_staff)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Lecturers
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000006', role_user),
    ('00000000-0000-0000-0001-000000000007', role_user),
    ('00000000-0000-0000-0001-000000000008', role_user)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Multi-role (Manager + Staff)
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000009', role_manager),
    ('00000000-0000-0000-0001-000000000009', role_staff)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check auth users created
SELECT 'Auth Users' as check, COUNT(*) as count FROM auth.users WHERE email LIKE '%@eiu.edu.vn';

-- Check public users created
SELECT 'Public Users' as check, COUNT(*) as count FROM public.users WHERE email LIKE '%@eiu.edu.vn';

-- Check roles assigned
SELECT 'User Roles' as check, COUNT(*) as count FROM user_roles;
