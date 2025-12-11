-- ============================================================
-- YCCV - DEV SEED DATA (FIXED VERSION)
-- File: supabase/seed_dev_fixed.sql
-- ============================================================
-- 
-- NOTE: RUN THIS WITH SERVICE ROLE KEY to bypass RLS
-- 
-- In Supabase Dashboard:
-- 1. SQL Editor
-- 2. Make sure you're using appropriate permissions
-- 3. Run this script
--
-- ============================================================

-- ============================================================
-- DISABLE RLS TEMPORARILY (to allow seed)
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
-- 1. UNITS (Đơn vị) - ALREADY EXISTS IN MIGRATION
-- ============================================================
-- Unit 1 (Nursing) and Unit 2 (Medicine) already inserted in migration
-- Just verify they exist
SELECT 'Units' as check, COUNT(*) as count FROM units;

-- ============================================================
-- 2. CATEGORIES (Danh mục)
-- ============================================================

-- Get teaching_equipment category
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

SELECT 'Categories' as check, COUNT(*) as count FROM categories;

-- ============================================================
-- 3. USERS (Người dùng) - ALREADY CREATED BY setup_auth_complete.sql
-- ============================================================
-- Just verify they exist
SELECT 'Users' as check, COUNT(*) as count FROM users WHERE email LIKE '%@eiu.edu.vn';

-- ============================================================
-- 4. USER_ROLES (Vai trò người dùng) - ALREADY ASSIGNED
-- ============================================================
-- Just verify they exist
SELECT 'User Roles' as check, COUNT(*) as count FROM user_roles;

-- ============================================================
-- 5. REQUESTS & REQUEST_ITEMS (Yêu cầu và vật tư)
-- ============================================================

-- Store category IDs in variables
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
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    NOW() - INTERVAL '10 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', cat_medical, 'Găng tay y tế size S', 'Hộp', 10, CURRENT_DATE + 14, 1),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', cat_medical, 'Găng tay y tế size M', 'Hộp', 15, CURRENT_DATE + 14, 2)
  ON CONFLICT (id) DO NOTHING;

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
    '00000000-0000-0000-0001-000000000007', -- lecturer02
    NOW() - INTERVAL '8 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000002', cat_office, 'Sách Điều dưỡng cơ bản', 'Quyển', 5, CURRENT_DATE + 30, 1)
  ON CONFLICT (id) DO NOTHING;

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
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    NOW() - INTERVAL '5 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000003', cat_medical, 'Kim tiêm 5ml', 'Cái', 100, CURRENT_DATE + 7, 1),
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000003', cat_medical, 'Kim tiêm 10ml', 'Cái', 50, CURRENT_DATE + 7, 2)
  ON CONFLICT (id) DO NOTHING;

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
    '00000000-0000-0000-0001-000000000008', -- lecturer03
    NOW() - INTERVAL '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000004', cat_mannequin, 'Mannequin CPR', 'Bộ', 1, CURRENT_DATE + 1, 1)
  ON CONFLICT (id) DO NOTHING;

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
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '6 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000005', cat_medical, 'Băng gạc vô trùng 10x10cm', 'Gói', 20, CURRENT_DATE + 7, 1),
    ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000005', cat_medical, 'Băng cuộn co giãn', 'Cuộn', 30, CURRENT_DATE + 7, 2)
  ON CONFLICT (id) DO NOTHING;

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
    '00000000-0000-0000-0001-000000000007', -- lecturer02
    '00000000-0000-0000-0001-000000000005', -- staff02
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '4 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000006', cat_teaching, 'Bảo trì máy đo huyết áp Omron', 'Máy', 3, CURRENT_DATE + 5, 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-007: ASSIGNED - multiuser -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000007', 7,
    'Đặt mua ống nghe mới cho phòng khám mô phỏng',
    'NORMAL', 'ASSIGNED',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000009', -- multiuser
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '5 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000007', cat_teaching, 'Ống nghe Littmann Classic III', 'Cái', 5, CURRENT_DATE + 14, 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-008: IN_PROGRESS - lecturer01 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000008', 8,
    'Xin dụng cụ tiêm truyền cho buổi thực hành lâm sàng',
    'NORMAL', 'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '7 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000008', cat_medical, 'Bộ dây truyền dịch', 'Bộ', 20, CURRENT_DATE + 3, 1),
    ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000008', cat_medical, 'Kim luồn 20G', 'Cái', 50, CURRENT_DATE + 3, 2)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-009: IN_PROGRESS - lecturer02 -> staff02 (HIGH)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000009', 9,
    'Sửa chữa mô hình giải phẫu tim - bị hỏng van tim và dây chằng',
    'HIGH', 'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000007', -- lecturer02
    '00000000-0000-0000-0001-000000000005', -- staff02
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '8 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000009', cat_anatomy, 'Mô hình tim người', 'Bộ', 1, CURRENT_DATE + 14, 1),
    ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000009', cat_anatomy, 'Phụ kiện thay thế (van, dây)', 'Cái', 2, CURRENT_DATE + 14, 2)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-010: IN_PROGRESS - manager01 -> staff01 (URGENT)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000010', 10,
    '[ƯU TIÊN] Chuẩn bị thiết bị cho kỳ thi cuối kỳ - cần gấp trong 2 ngày',
    'URGENT', 'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000002', -- manager01
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '3 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, required_at, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000010', cat_teaching, 'Máy đo SpO2', 'Máy', 10, CURRENT_DATE + 2, 1),
    ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000010', cat_teaching, 'Nhiệt kế điện tử', 'Cái', 20, CURRENT_DATE + 2, 2),
    ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000010', cat_medical, 'Bông cồn', 'Hộp', 10, CURRENT_DATE + 2, 3)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-011: NEED_INFO - lecturer01 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000011', 11,
    'Xin thêm bông gòn cho phòng Lab - số lượng chưa rõ',
    'NORMAL', 'NEED_INFO',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '6 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, notes, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000011', cat_medical, 'Bông gòn y tế', 'Gói', 0, 'Cần xác nhận số lượng', 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-012: NEED_INFO - lecturer03 -> staff01 (HIGH)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000012', 12,
    'Thay màn hình LCD trong phòng học - cần xác nhận model tương thích',
    'HIGH', 'NEED_INFO',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000008', -- lecturer03
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '5 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, notes, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0002-000000000012', cat_teaching, 'Màn hình LCD 55 inch', 'Cái', 1, 'Cần xác nhận model: Samsung hoặc LG?', 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-013: DONE - lecturer02 -> staff01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at,
    completion_note, completed_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000013', 13,
    'Xin cấp băng keo y tế cho phòng thực hành',
    'NORMAL', 'DONE',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000007', -- lecturer02
    '00000000-0000-0000-0001-000000000004', -- staff01
    NOW() - INTERVAL '10 days',
    'Đã bàn giao đủ 20 cuộn băng keo. GV đã ký nhận.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '12 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0002-000000000013', cat_medical, 'Băng keo y tế 3M', 'Cuộn', 20, 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-014: DONE - multiuser -> staff02 (LOW)
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    assignee_id, assigned_at,
    completion_note, completed_at, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000014', 14,
    'Sửa đèn phòng Lab - 2 bóng bị cháy',
    'LOW', 'DONE',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000009', -- multiuser
    '00000000-0000-0000-0001-000000000005', -- staff02
    NOW() - INTERVAL '8 days',
    'Đã thay 2 bóng đèn LED mới. Phòng Lab hoạt động bình thường.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '10 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000014', cat_office, 'Bóng đèn LED 18W', 'Bóng', 2, 1)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- REQ-015: CANCELLED - lecturer01
  -- --------------------------------------------------------
  INSERT INTO requests (
    id, request_number, reason, priority, status,
    unit_id, unit_name_snapshot, created_by,
    cancel_reason, cancelled_at, cancelled_by, created_at
  ) VALUES (
    '00000000-0000-0000-0002-000000000015', 15,
    'Xin vật tư thực hành - trùng với phiếu REQ-005',
    'NORMAL', 'CANCELLED',
    '00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng',
    '00000000-0000-0000-0001-000000000006', -- lecturer01
    'Huỷ do trùng lặp với phiếu REQ-005 đã được xử lý',
    NOW() - INTERVAL '4 days',
    '00000000-0000-0000-0001-000000000006', -- cancelled by creator
    NOW() - INTERVAL '7 days'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO request_items (id, request_id, category_id, item_name, unit_count, quantity, sort_order)
  VALUES 
    ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000015', cat_medical, 'Băng gạc (đã huỷ)', 'Gói', 10, 1)
  ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================================
-- 6. COMMENTS (Trao đổi)
-- ============================================================

-- Comment on REQ-008 (IN_PROGRESS)
INSERT INTO request_comments (
  id, request_id, user_id, content, created_at
) VALUES (
  '00000000-0000-0000-0004-000000000001',
  '00000000-0000-0000-0002-000000000008',
  '00000000-0000-0000-0001-000000000004', -- staff01
  'Đã tìm được hãng cung cấp. Kim luồn còn hàng, dây truyền cần chờ 3 ngày.',
  NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Comment on REQ-012 (NEED_INFO - asking for model)
INSERT INTO request_comments (
  id, request_id, user_id, content, created_at
) VALUES (
  '00000000-0000-0000-0004-000000000002',
  '00000000-0000-0000-0002-000000000012',
  '00000000-0000-0000-0001-000000000004', -- staff01
  'Các anh/chị ơi, hiện tại chúng tôi có giá thành:\n- Samsung LH55 QMFBR: 8.5 triệu\n- LG 55LH5C: 7.2 triệu\nAnh/chị vui lòng xác nhận model ưu tiên để chúng tôi tiến hành đặt hàng.',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. RE-ENABLE RLS
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
-- 8. VERIFICATION
-- ============================================================

SELECT '=== SEED DATA SUMMARY ===' as info;
SELECT 'Requests' as entity, COUNT(*) as count FROM requests;
SELECT 'Request Items' as entity, COUNT(*) as count FROM request_items;
SELECT 'Comments' as entity, COUNT(*) as count FROM request_comments;
SELECT 'Users' as entity, COUNT(*) as count FROM users WHERE email LIKE '%@eiu.edu.vn';
SELECT 'User Roles' as entity, COUNT(*) as count FROM user_roles;

SELECT '=== REQUESTS BY STATUS ===' as info;
SELECT status, COUNT(*) FROM requests GROUP BY status ORDER BY status;

SELECT '=== VERIFICATION COMPLETE ===' as info;
