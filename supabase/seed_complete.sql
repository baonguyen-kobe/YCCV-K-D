-- ============================================================
-- YCCV - SEED DATA FOR WHITELIST & TEST DATA
-- File: supabase/seed_complete.sql
-- ============================================================
-- 
-- RUN ORDER:
-- 1. Run migration 0001_init.sql FIRST (creates schema)
-- 2. Then run THIS file in Supabase SQL Editor
--
-- NOTE: This file only seeds:
-- - Whitelist users (public.users with is_active flag)
-- - Roles & role assignments
-- - Categories & sample requests
-- 
-- Auth users are created via Google OAuth callback
-- ============================================================

-- ============================================================
-- STEP 0: DISABLE RLS FOR SEEDING
-- ============================================================

ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE request_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 1: CREATE WHITELIST USERS (public.users only)
-- ============================================================
-- These users will be checked during Google OAuth callback
-- Add your institutional email addresses here with is_active = true

DELETE FROM public.users WHERE email LIKE '%@eiu.edu.vn';

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
  ('00000000-0000-0000-0001-000000000009', 'multiuser@eiu.edu.vn', 'Ngô Đa Vai', '0901000009', '00000000-0000-0000-0000-000000000001', true);

-- ============================================================
-- STEP 2: ASSIGN ROLES
-- ============================================================

-- Clear existing role assignments for test users
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@eiu.edu.vn'
);

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
    ('00000000-0000-0000-0001-000000000001', role_admin);

  -- Managers
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000002', role_manager),
    ('00000000-0000-0000-0001-000000000003', role_manager);

  -- Staff
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000004', role_staff),
    ('00000000-0000-0000-0001-000000000005', role_staff);

  -- Lecturers (Users)
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000006', role_user),
    ('00000000-0000-0000-0001-000000000007', role_user),
    ('00000000-0000-0000-0001-000000000008', role_user);

  -- Multi-role (Manager + Staff)
  INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000009', role_manager),
    ('00000000-0000-0000-0001-000000000009', role_staff);
END $$;

-- ============================================================
-- STEP 3: CREATE CATEGORIES (Sub-categories)
-- ============================================================

DO $$
DECLARE
  teaching_equip_id UUID;
BEGIN
  SELECT id INTO teaching_equip_id FROM categories WHERE code = 'TEACHING_EQUIPMENT' LIMIT 1;
  
  -- Insert sub-categories
  INSERT INTO categories (id, name, code, parent_id, unit_id, is_active, sort_order)
  VALUES 
    ('00000000-0000-0000-0000-000000000101', 'Mô hình giải phẫu', 'ANATOMY_MODELS', teaching_equip_id, '00000000-0000-0000-0000-000000000001', true, 1),
    ('00000000-0000-0000-0000-000000000102', 'Mannequin thực hành', 'PRACTICE_MANNEQUINS', teaching_equip_id, '00000000-0000-0000-0000-000000000001', true, 2)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================
-- STEP 4: CREATE SAMPLE REQUESTS
-- ============================================================

DO $$
DECLARE
  cat_medical UUID;
  cat_office UUID;
  cat_teaching UUID;
  cat_anatomy UUID;
  cat_mannequin UUID;
BEGIN
  SELECT id INTO cat_medical FROM categories WHERE code = 'MEDICAL_SUPPLIES' LIMIT 1;
  SELECT id INTO cat_office FROM categories WHERE code = 'OFFICE_SUPPLIES' LIMIT 1;
  SELECT id INTO cat_teaching FROM categories WHERE code = 'TEACHING_EQUIPMENT' LIMIT 1;
  SELECT id INTO cat_anatomy FROM categories WHERE code = 'ANATOMY_MODELS' LIMIT 1;
  SELECT id INTO cat_mannequin FROM categories WHERE code = 'PRACTICE_MANNEQUINS' LIMIT 1;

  -- Clean existing requests
  DELETE FROM requests WHERE id::text LIKE '00000000-0000-0000-0002-%';

  -- --------------------------------------------------------
  -- REQ-001: DRAFT - lecturer01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status, 
    unit_id, unit_name_snapshot, created_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000001', 1,
    '[Nháp] Xin bổ sung găng tay y tế cho phòng thực hành. Số lượng hiện tại không đủ cho sinh viên.',
    'NORMAL', 'DRAFT',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    NOW() - INTERVAL '10 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', cat_medical, 'Găng tay y tế size S', 'Hộp', 10, CURRENT_DATE + 14, 1),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', cat_medical, 'Găng tay y tế size M', 'Hộp', 15, CURRENT_DATE + 14, 2);

  -- --------------------------------------------------------
  -- REQ-002: DRAFT - lecturer02
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000002', 2,
    '[Nháp] Đề xuất mua thêm sách tham khảo cho thư viện khoa',
    'LOW', 'DRAFT',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000007',
    NOW() - INTERVAL '8 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000002', cat_office, 'Sách Điều dưỡng cơ bản', 'Quyển', 5, CURRENT_DATE + 30, 1);

  -- --------------------------------------------------------
  -- REQ-003: NEW - lecturer01 (HIGH priority)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000003', 3,
    'Xin cấp kim tiêm thực hành cho sinh viên năm 2. Lớp ĐD2023 cần thực hành kỹ năng tiêm trong tuần tới.',
    'HIGH', 'NEW',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    NOW() - INTERVAL '5 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000003', cat_medical, 'Kim tiêm 5ml', 'Cái', 100, CURRENT_DATE + 7, 1),
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000003', cat_medical, 'Kim tiêm 10ml', 'Cái', 50, CURRENT_DATE + 7, 2);

  -- --------------------------------------------------------
  -- REQ-004: NEW - lecturer03 (URGENT)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000004', 4,
    'Mannequin thực hành bị hỏng - cần thay gấp để kịp buổi thi thực hành ngày mai!',
    'URGENT', 'NEW',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000008',
    NOW() - INTERVAL '1 day'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000004', cat_mannequin, 'Mannequin CPR', 'Bộ', 1, CURRENT_DATE + 1, 1);

  -- --------------------------------------------------------
  -- REQ-005: ASSIGNED - lecturer01 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by, 
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000005', 5,
    'Xin vật tư băng gạc cho Lab Điều dưỡng. Chuẩn bị cho buổi thực hành tuần sau.',
    'NORMAL', 'ASSIGNED',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0001-000000000004',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '6 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000005', cat_medical, 'Băng gạc vô trùng 10x10cm', 'Gói', 20, CURRENT_DATE + 7, 1),
    ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000005', cat_medical, 'Băng cuộn co giãn', 'Cuộn', 30, CURRENT_DATE + 7, 2);

  -- --------------------------------------------------------
  -- REQ-006: ASSIGNED - lecturer02 -> staff02 (HIGH)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000006', 6,
    'Yêu cầu bảo trì máy đo huyết áp. 3 máy trong phòng Lab đang hiển thị sai số.',
    'HIGH', 'ASSIGNED',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0001-000000000005',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '4 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000006', cat_teaching, 'Bảo trì máy đo huyết áp Omron', 'Máy', 3, CURRENT_DATE + 5, 1);

  -- --------------------------------------------------------
  -- REQ-007: IN_PROGRESS - lecturer01 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000007', 7,
    'Xin dụng cụ tiêm truyền cho buổi thực hành lâm sàng',
    'NORMAL', 'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0001-000000000004',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '7 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000007', cat_medical, 'Bộ dây truyền dịch', 'Bộ', 20, CURRENT_DATE + 3, 1),
    ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000007', cat_medical, 'Kim luồn 20G', 'Cái', 50, CURRENT_DATE + 3, 2);

  -- --------------------------------------------------------
  -- REQ-008: IN_PROGRESS - manager01 -> staff01 (URGENT)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000008', 8,
    '[ƯU TIÊN] Chuẩn bị thiết bị cho kỳ thi cuối kỳ - cần gấp trong 2 ngày',
    'URGENT', 'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0001-000000000004',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '3 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000008', cat_teaching, 'Máy đo SpO2', 'Máy', 10, CURRENT_DATE + 2, 1),
    ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000008', cat_teaching, 'Nhiệt kế điện tử', 'Cái', 20, CURRENT_DATE + 2, 2);

  -- --------------------------------------------------------
  -- REQ-009: NEED_INFO - lecturer01 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000009', 9,
    'Xin thêm bông gòn cho phòng Lab - số lượng chưa rõ',
    'NORMAL', 'NEED_INFO',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0001-000000000004',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '6 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, notes, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000009', cat_medical, 'Bông gòn y tế', 'Gói', 0, 'Cần xác nhận số lượng', 1);

  -- --------------------------------------------------------
  -- REQ-010: DONE - lecturer02 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at,
    completion_note, completed_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000010', 10,
    'Xin cấp băng keo y tế cho phòng thực hành',
    'NORMAL', 'DONE',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0001-000000000004',
    NOW() - INTERVAL '10 days',
    'Đã bàn giao đủ 20 cuộn băng keo. GV đã ký nhận.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '12 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000010', cat_medical, 'Băng keo y tế 3M', 'Cuộn', 20, 1);

  -- --------------------------------------------------------
  -- REQ-011: CANCELLED - lecturer01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    cancel_reason, cancelled_at, cancelled_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000011', 11,
    'Xin vật tư thực hành - trùng với phiếu REQ-005',
    'NORMAL', 'CANCELLED',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006',
    'Huỷ do trùng lặp với phiếu REQ-005 đã được xử lý',
    NOW() - INTERVAL '4 days',
    '00000000-0000-0000-0001-000000000006',
    NOW() - INTERVAL '7 days'
  );

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000011', cat_medical, 'Băng gạc (đã huỷ)', 'Gói', 10, 1);

END $$;

-- ============================================================
-- STEP 5: CREATE SAMPLE COMMENTS
-- ============================================================

-- Clean existing comments
DELETE FROM request_comments WHERE id::text LIKE '00000000-0000-0000-0004-%';

-- Comment on REQ-007 (IN_PROGRESS)
INSERT INTO request_comments (id, request_id, user_id, content, created_at)
VALUES (
  '00000000-0000-0000-0004-000000000001',
  '00000000-0000-0000-0002-000000000007',
  '00000000-0000-0000-0001-000000000004',
  'Đã tìm được hãng cung cấp. Kim luồn còn hàng, dây truyền cần chờ 3 ngày.',
  NOW() - INTERVAL '2 days'
);

-- Comment on REQ-009 (NEED_INFO)
INSERT INTO request_comments (id, request_id, user_id, content, created_at)
VALUES (
  '00000000-0000-0000-0004-000000000002',
  '00000000-0000-0000-0002-000000000009',
  '00000000-0000-0000-0001-000000000004',
  'Anh/chị vui lòng xác nhận số lượng bông gòn cần thiết để em tiến hành đặt hàng.',
  NOW() - INTERVAL '1 day'
);

-- ============================================================
-- STEP 6: CONFIGURE RLS POLICIES
-- ============================================================

-- Drop ALL existing policies (for re-run safety)
DROP POLICY IF EXISTS units_select ON units;
DROP POLICY IF EXISTS roles_select ON roles;
DROP POLICY IF EXISTS user_roles_select ON user_roles;
DROP POLICY IF EXISTS user_roles_insert ON user_roles;
DROP POLICY IF EXISTS user_roles_delete ON user_roles;
DROP POLICY IF EXISTS categories_select ON categories;
DROP POLICY IF EXISTS categories_insert ON categories;
DROP POLICY IF EXISTS categories_update ON categories;
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS requests_select ON requests;
DROP POLICY IF EXISTS requests_insert ON requests;
DROP POLICY IF EXISTS requests_update ON requests;
DROP POLICY IF EXISTS request_items_select ON request_items;
DROP POLICY IF EXISTS request_items_insert ON request_items;
DROP POLICY IF EXISTS request_items_update ON request_items;
DROP POLICY IF EXISTS request_items_delete ON request_items;
DROP POLICY IF EXISTS request_comments_select ON request_comments;
DROP POLICY IF EXISTS request_comments_insert ON request_comments;
DROP POLICY IF EXISTS attachments_select ON attachments;
DROP POLICY IF EXISTS attachments_insert ON attachments;
DROP POLICY IF EXISTS request_logs_select ON request_logs;
DROP POLICY IF EXISTS request_logs_insert ON request_logs;

-- Units: Everyone can read active units
CREATE POLICY units_select ON units FOR SELECT USING (true);

-- Roles: Everyone can read roles
CREATE POLICY roles_select ON roles FOR SELECT USING (true);

-- User Roles: Everyone can read user_roles (needed for permission checks)
CREATE POLICY user_roles_select ON user_roles FOR SELECT USING (true);

-- User Roles: Only admin can insert/update/delete
CREATE POLICY user_roles_insert ON user_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin')
);
CREATE POLICY user_roles_delete ON user_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin')
);

-- ============================================================
-- USERS TABLE RLS POLICIES
-- ============================================================

-- Users: Authenticated users can read all users (needed for names display)
CREATE POLICY users_select ON users FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Users: Admin can create, or self-insert during signup
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (
  user_has_role(auth.uid(), 'admin')
  OR id = auth.uid()
);

-- Users: Admin can update any, users can update own profile
CREATE POLICY users_update ON users FOR UPDATE USING (
  user_has_role(auth.uid(), 'admin')
  OR id = auth.uid()
);

-- Categories: Everyone can read categories
CREATE POLICY categories_select ON categories FOR SELECT USING (true);

-- Categories: Admin/Manager can manage
CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager'))
);
CREATE POLICY categories_update ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager'))
);

-- ============================================================
-- REQUESTS TABLE RLS POLICIES
-- ============================================================

-- Requests: Authenticated users can read requests they have access to
CREATE POLICY requests_select ON requests FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- User created the request
    created_by = auth.uid()
    -- User is assigned to the request
    OR assignee_id = auth.uid()
    -- User is admin/manager/staff (can see all)
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin', 'manager', 'staff')
    )
  )
);

-- Requests: Authenticated users can create requests
CREATE POLICY requests_insert ON requests FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

-- Requests: Users can update their own drafts, staff/manager/admin can update assigned requests
CREATE POLICY requests_update ON requests FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    -- Owner can update their drafts
    (created_by = auth.uid() AND status = 'DRAFT')
    -- Assignee can update
    OR assignee_id = auth.uid()
    -- Admin/Manager/Staff can update
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin', 'manager', 'staff')
    )
  )
);

-- ============================================================
-- REQUEST_ITEMS TABLE RLS POLICIES
-- ============================================================

CREATE POLICY request_items_select ON request_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    r.created_by = auth.uid()
    OR r.assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles ro ON ur.role_id = ro.id 
      WHERE ur.user_id = auth.uid() 
      AND ro.name IN ('admin', 'manager', 'staff')
    )
  ))
);

CREATE POLICY request_items_insert ON request_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.created_by = auth.uid())
);

CREATE POLICY request_items_update ON request_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    r.created_by = auth.uid()
    OR r.assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles ro ON ur.role_id = ro.id 
      WHERE ur.user_id = auth.uid() 
      AND ro.name IN ('admin', 'manager', 'staff')
    )
  ))
);

CREATE POLICY request_items_delete ON request_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.created_by = auth.uid() AND r.status = 'DRAFT')
);

-- ============================================================
-- REQUEST_COMMENTS TABLE RLS POLICIES
-- ============================================================

CREATE POLICY request_comments_select ON request_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    r.created_by = auth.uid()
    OR r.assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles ro ON ur.role_id = ro.id 
      WHERE ur.user_id = auth.uid() 
      AND ro.name IN ('admin', 'manager', 'staff')
    )
  ))
);

CREATE POLICY request_comments_insert ON request_comments FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- ============================================================
-- ATTACHMENTS TABLE RLS POLICIES
-- ============================================================

CREATE POLICY attachments_select ON attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    r.created_by = auth.uid()
    OR r.assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles ro ON ur.role_id = ro.id 
      WHERE ur.user_id = auth.uid() 
      AND ro.name IN ('admin', 'manager', 'staff')
    )
  ))
);

CREATE POLICY attachments_insert ON attachments FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND uploaded_by = auth.uid()
);

-- ============================================================
-- REQUEST_LOGS TABLE RLS POLICIES
-- ============================================================

CREATE POLICY request_logs_select ON request_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND (
    r.created_by = auth.uid()
    OR r.assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles ro ON ur.role_id = ro.id 
      WHERE ur.user_id = auth.uid() 
      AND ro.name IN ('admin', 'manager', 'staff')
    )
  ))
);

CREATE POLICY request_logs_insert ON request_logs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- ============================================================
-- STEP 7: RE-ENABLE RLS
-- ============================================================

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 8: VERIFICATION
-- ============================================================

SELECT '=== SEED DATA SUMMARY ===' as info;
SELECT 'Auth Users' as entity, COUNT(*) as count FROM auth.users WHERE email LIKE '%@eiu.edu.vn';
SELECT 'Public Users' as entity, COUNT(*) as count FROM public.users WHERE email LIKE '%@eiu.edu.vn';
SELECT 'User Roles' as entity, COUNT(*) as count FROM user_roles;
SELECT 'Requests' as entity, COUNT(*) as count FROM requests;
SELECT 'Request Items' as entity, COUNT(*) as count FROM request_items;
SELECT 'Comments' as entity, COUNT(*) as count FROM request_comments;

SELECT '=== REQUESTS BY STATUS ===' as info;
SELECT status, COUNT(*) as count FROM requests GROUP BY status ORDER BY status;

SELECT '=== TEST CREDENTIALS ===' as info;
SELECT 'admin@eiu.edu.vn / Admin@123' as credentials UNION ALL
SELECT 'manager01@eiu.edu.vn / Manager@123' UNION ALL
SELECT 'staff01@eiu.edu.vn / Staff@123' UNION ALL
SELECT 'lecturer01@eiu.edu.vn / User@123';

SELECT '=== VERIFICATION COMPLETE ===' as info;

