-- ============================================================
-- YCCV - Hệ thống Yêu cầu Công việc
-- Migration: 0001_full_schema.sql
-- Description: Full database schema, constraints, rate limiting, optimistic locking, atomic RPCs
-- Based on PRD v7.0 and all previous migrations
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE request_status AS ENUM (
  'DRAFT', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'NEED_INFO', 'DONE', 'CANCELLED'
);
CREATE TYPE priority_level AS ENUM (
  'LOW', 'NORMAL', 'HIGH', 'URGENT'
);
CREATE TYPE attachment_type AS ENUM (
  'file', 'external_url'
);

-- TABLES
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO roles (name, display_name, description) VALUES
  ('admin', 'Quản trị viên', 'Toàn quyền quản trị hệ thống'),
  ('manager', 'Quản lý vận hành', 'Tiếp nhận, phân công, duyệt yêu cầu'),
  ('staff', 'Chuyên viên', 'Nhận và xử lý công việc được giao'),
  ('user', 'Giảng viên', 'Tạo và theo dõi yêu cầu công việc');
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, role_id)
);
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number SERIAL,
  reason TEXT NOT NULL,
  priority priority_level DEFAULT 'NORMAL',
  status request_status DEFAULT 'DRAFT',
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_name_snapshot VARCHAR(255),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  completion_note TEXT,
  completed_at TIMESTAMPTZ,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assignee_id ON requests(assignee_id);
CREATE INDEX idx_requests_unit_id ON requests(unit_id);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_version ON requests(id, version);
CREATE TABLE request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  item_name VARCHAR(500) NOT NULL,
  unit_count VARCHAR(50),
  quantity DECIMAL(10, 2) DEFAULT 1,
  required_at DATE,
  link_ref TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_request_items_request_id ON request_items(request_id);
CREATE INDEX idx_request_items_required_at ON request_items(required_at);
CREATE INDEX idx_request_items_item_name ON request_items USING GIN(to_tsvector('vietnamese', item_name));
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type attachment_type DEFAULT 'file',
  file_size INTEGER,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  temp_token VARCHAR(100),
  is_attached BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_attachments_request_id ON attachments(request_id);
CREATE INDEX idx_attachments_temp_token ON attachments(temp_token) WHERE temp_token IS NOT NULL;
CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_comments_created_at ON request_comments(created_at);
CREATE INDEX idx_request_comments_content ON request_comments USING GIN(to_tsvector('vietnamese', content));
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  old_status request_status,
  new_status request_status,
  meta_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_request_logs_request_id ON request_logs(request_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX idx_request_logs_request_created ON request_logs(request_id, created_at DESC);
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_logged_at ON auth_logs(logged_at DESC);
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, action, window_start)
);
CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action);
CREATE TABLE cron_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name VARCHAR(100) NOT NULL,
  job_date DATE NOT NULL,
  request_id UUID,
  email_recipient VARCHAR(255),
  email_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_name, job_date, request_id, email_recipient, email_type)
);
CREATE INDEX idx_cron_logs_job_date ON cron_logs(job_date DESC);
CREATE INDEX idx_cron_logs_request_id ON cron_logs(request_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_unit_id ON users(unit_id);

-- CONSTRAINTS
ALTER TABLE request_items ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0);
ALTER TABLE requests ADD CONSTRAINT check_reason_not_empty CHECK (LENGTH(TRIM(reason)) > 0);
ALTER TABLE request_items ADD CONSTRAINT check_item_name_not_empty CHECK (LENGTH(TRIM(item_name)) > 0);

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_request_items_updated_at BEFORE UPDATE ON request_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_request_comments_updated_at BEFORE UPDATE ON request_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE FUNCTION log_request_status_change() RETURNS TRIGGER AS $$ BEGIN IF OLD.status IS DISTINCT FROM NEW.status THEN INSERT INTO request_logs (request_id, user_id, action, old_status, new_status, meta_data) VALUES (NEW.id, COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.created_by), 'status_change', OLD.status, NEW.status, jsonb_build_object('completion_note', CASE WHEN NEW.status = 'DONE' THEN NEW.completion_note ELSE NULL END, 'cancel_reason', CASE WHEN NEW.status = 'CANCELLED' THEN NEW.cancel_reason ELSE NULL END)); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER tr_request_status_change AFTER UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION log_request_status_change();
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = user_uuid AND r.name = role_name); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_user_unit_id(user_uuid UUID) RETURNS UUID AS $$ DECLARE unit UUID; BEGIN SELECT unit_id INTO unit FROM users WHERE id = user_uuid; RETURN unit; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(p_user_id UUID, p_action VARCHAR(100), p_limit INTEGER DEFAULT 5, p_window_minutes INTEGER DEFAULT 1) RETURNS TABLE (allowed BOOLEAN, current_count INTEGER, reset_at TIMESTAMPTZ) AS $$ DECLARE v_window_start TIMESTAMPTZ; v_current_count INTEGER; v_reset_at TIMESTAMPTZ; BEGIN v_window_start := DATE_TRUNC('minute', NOW()); v_reset_at := v_window_start + (p_window_minutes || ' minutes')::INTERVAL; SELECT count INTO v_current_count FROM rate_limits WHERE user_id = p_user_id AND action = p_action AND window_start = v_window_start; IF v_current_count IS NULL THEN v_current_count := 0; END IF; IF v_current_count >= p_limit THEN RETURN QUERY SELECT false, v_current_count, v_reset_at; ELSE INSERT INTO rate_limits (user_id, action, window_start, count) VALUES (p_user_id, p_action, v_window_start, 1) ON CONFLICT (user_id, action, window_start) DO UPDATE SET count = rate_limits.count + 1; RETURN QUERY SELECT true, v_current_count + 1, v_reset_at; END IF; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_request_with_locking(p_request_id UUID, p_current_version INTEGER, p_new_status request_status DEFAULT NULL, p_assignee_id UUID DEFAULT NULL, p_completion_note TEXT DEFAULT NULL, p_cancel_reason TEXT DEFAULT NULL, p_reason TEXT DEFAULT NULL, p_priority priority_level DEFAULT NULL) RETURNS TABLE (success BOOLEAN, new_version INTEGER, error_message TEXT) AS $$ DECLARE v_updated_rows INTEGER; v_new_version INTEGER; BEGIN UPDATE requests SET status = COALESCE(p_new_status, status), assignee_id = COALESCE(p_assignee_id, assignee_id), completion_note = COALESCE(p_completion_note, completion_note), cancel_reason = COALESCE(p_cancel_reason, cancel_reason), reason = COALESCE(p_reason, reason), priority = COALESCE(p_priority, priority), version = version + 1 WHERE id = p_request_id AND version = p_current_version RETURNING version INTO v_new_version; GET DIAGNOSTICS v_updated_rows = ROW_COUNT; IF v_updated_rows = 0 THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, 'Phiếu đã bị thay đổi bởi người khác. Vui lòng tải lại trang.'::TEXT; ELSE RETURN QUERY SELECT true::BOOLEAN, v_new_version, NULL::TEXT; END IF; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION create_request_atomic(p_reason TEXT, p_priority priority_level DEFAULT 'NORMAL', p_unit_id UUID DEFAULT NULL, p_unit_name_snapshot TEXT DEFAULT NULL, p_created_by UUID, p_items JSONB) RETURNS TABLE (success BOOLEAN, request_id UUID, error_message TEXT) AS $$ DECLARE v_request_id UUID; v_item JSONB; v_sort_order INTEGER := 0; BEGIN IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) = 0 THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, 'Lý do yêu cầu không được để trống'::TEXT; RETURN; END IF; IF p_created_by IS NULL THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, 'Người tạo không hợp lệ'::TEXT; RETURN; END IF; IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, 'Cần ít nhất 1 hạng mục yêu cầu'::TEXT; RETURN; END IF; INSERT INTO requests (reason, priority, status, unit_id, unit_name_snapshot, created_by) VALUES (TRIM(p_reason), COALESCE(p_priority, 'NORMAL'), 'DRAFT', p_unit_id, p_unit_name_snapshot, p_created_by) RETURNING id INTO v_request_id; FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP INSERT INTO request_items (request_id, item_name, category_id, unit_count, quantity, required_at, link_ref, notes, sort_order) VALUES (v_request_id, TRIM((v_item->>'item_name')::TEXT), (v_item->>'category_id')::UUID, (v_item->>'unit_count')::TEXT, COALESCE((v_item->>'quantity')::NUMERIC, 1), (v_item->>'required_at')::DATE, (v_item->>'link_ref')::TEXT, (v_item->>'notes')::TEXT, v_sort_order); v_sort_order := v_sort_order + 1; END LOOP; INSERT INTO request_logs (request_id, user_id, action, new_status) VALUES (v_request_id, p_created_by, 'created', 'DRAFT'); RETURN QUERY SELECT true::BOOLEAN, v_request_id, NULL::TEXT; EXCEPTION WHEN check_violation THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, ('Lỗi dữ liệu: ' || SQLERRM)::TEXT; WHEN foreign_key_violation THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, ('Dữ liệu tham chiếu không hợp lệ: ' || SQLERRM)::TEXT; WHEN OTHERS THEN RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, ('Lỗi không xác định: ' || SQLERRM)::TEXT; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION update_request_atomic(p_request_id UUID, p_current_version INTEGER, p_reason TEXT DEFAULT NULL, p_priority priority_level DEFAULT NULL, p_items JSONB DEFAULT NULL) RETURNS TABLE (success BOOLEAN, new_version INTEGER, error_message TEXT) AS $$ DECLARE v_updated_rows INTEGER; v_new_version INTEGER; v_current_status request_status; v_item JSONB; v_sort_order INTEGER := 0; BEGIN SELECT status, version INTO v_current_status, v_new_version FROM requests WHERE id = p_request_id; IF v_current_status IS NULL THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, 'Không tìm thấy yêu cầu'::TEXT; RETURN; END IF; IF v_current_status != 'DRAFT' THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, 'Chỉ có thể chỉnh sửa yêu cầu ở trạng thái Nháp'::TEXT; RETURN; END IF; UPDATE requests SET reason = COALESCE(TRIM(p_reason), reason), priority = COALESCE(p_priority, priority), version = version + 1 WHERE id = p_request_id AND version = p_current_version RETURNING version INTO v_new_version; GET DIAGNOSTICS v_updated_rows = ROW_COUNT; IF v_updated_rows = 0 THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, 'Phiếu đã bị thay đổi bởi người khác. Vui lòng tải lại trang.'::TEXT; RETURN; END IF; IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN DELETE FROM request_items WHERE request_id = p_request_id; FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP INSERT INTO request_items (request_id, item_name, category_id, unit_count, quantity, required_at, link_ref, notes, sort_order) VALUES (p_request_id, TRIM((v_item->>'item_name')::TEXT), (v_item->>'category_id')::UUID, (v_item->>'unit_count')::TEXT, COALESCE((v_item->>'quantity')::NUMERIC, 1), (v_item->>'required_at')::DATE, (v_item->>'link_ref')::TEXT, (v_item->>'notes')::TEXT, v_sort_order); v_sort_order := v_sort_order + 1; END LOOP; END IF; RETURN QUERY SELECT true::BOOLEAN, v_new_version, NULL::TEXT; EXCEPTION WHEN check_violation THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, ('Lỗi dữ liệu: ' || SQLERRM)::TEXT; WHEN OTHERS THEN RETURN QUERY SELECT false::BOOLEAN, p_current_version, ('Lỗi không xác định: ' || SQLERRM)::TEXT; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY requests_select ON requests FOR SELECT USING (user_has_role(auth.uid(), 'admin') OR (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid())) OR (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid()) OR created_by = auth.uid());
CREATE POLICY requests_insert ON requests FOR INSERT WITH CHECK (user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager') OR user_has_role(auth.uid(), 'user'));
CREATE POLICY requests_update ON requests FOR UPDATE USING (user_has_role(auth.uid(), 'admin') OR (created_by = auth.uid() AND status = 'DRAFT') OR (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid())) OR (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid()));
CREATE POLICY requests_delete ON requests FOR DELETE USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY request_items_select ON request_items FOR SELECT USING (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_items.request_id));
CREATE POLICY request_items_insert ON request_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_items.request_id AND (r.created_by = auth.uid() OR user_has_role(auth.uid(), 'admin'))));
CREATE POLICY request_items_update ON request_items FOR UPDATE USING (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_items.request_id AND (user_has_role(auth.uid(), 'admin') OR (r.created_by = auth.uid() AND r.status = 'DRAFT'))));
CREATE POLICY request_items_delete ON request_items FOR DELETE USING (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_items.request_id AND (user_has_role(auth.uid(), 'admin') OR (r.created_by = auth.uid() AND r.status = 'DRAFT'))));
CREATE POLICY request_comments_select ON request_comments FOR SELECT USING (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_comments.request_id) AND (is_internal = false OR user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager') OR user_has_role(auth.uid(), 'staff')));
CREATE POLICY request_comments_insert ON request_comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_comments.request_id) AND user_id = auth.uid() AND (is_internal = false OR user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager') OR user_has_role(auth.uid(), 'staff')));
CREATE POLICY attachments_select ON attachments FOR SELECT USING (request_id IS NULL OR EXISTS (SELECT 1 FROM requests r WHERE r.id = attachments.request_id));
CREATE POLICY attachments_insert ON attachments FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY attachments_delete ON attachments FOR DELETE USING (user_has_role(auth.uid(), 'admin') OR uploaded_by = auth.uid());
CREATE POLICY request_logs_select ON request_logs FOR SELECT USING (EXISTS (SELECT 1 FROM requests r WHERE r.id = request_logs.request_id));
CREATE POLICY request_logs_insert ON request_logs FOR INSERT WITH CHECK (true);
CREATE POLICY users_select ON users FOR SELECT USING (true);
CREATE POLICY users_update ON users FOR UPDATE USING (user_has_role(auth.uid(), 'admin') OR id = auth.uid());
CREATE POLICY rate_limits_select ON rate_limits FOR SELECT USING (user_id = auth.uid() OR user_has_role(auth.uid(), 'admin'));
CREATE POLICY rate_limits_insert ON rate_limits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY cron_logs_select ON cron_logs FOR SELECT USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY cron_logs_insert ON cron_logs FOR INSERT WITH CHECK (true);

-- SEED DATA
INSERT INTO units (id, name, code, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng', 'NURSING', 'Khoa Điều dưỡng - EIU'),
  ('00000000-0000-0000-0000-000000000002', 'Khoa Y Khoa', 'MEDICINE', 'Khoa Y Khoa - EIU');
INSERT INTO categories (name, code, unit_id) VALUES
  ('Vật tư y tế', 'MEDICAL_SUPPLIES', '00000000-0000-0000-0000-000000000001'),
  ('Thiết bị giảng dạy', 'TEACHING_EQUIPMENT', '00000000-0000-0000-0000-000000000001'),
  ('Văn phòng phẩm', 'OFFICE_SUPPLIES', NULL),
  ('Khác', 'OTHER', NULL);

-- COMMENTS
COMMENT ON TABLE units IS 'Đơn vị/Khoa trong tổ chức';
COMMENT ON TABLE users IS 'Người dùng hệ thống - whitelist qua is_active';
COMMENT ON TABLE roles IS 'Các vai trò: admin, manager, staff, user';
COMMENT ON TABLE user_roles IS 'Mapping user-role (multi-role support)';
COMMENT ON TABLE requests IS 'Phiếu yêu cầu công việc';
COMMENT ON TABLE request_items IS 'Chi tiết các hạng mục trong phiếu';
COMMENT ON TABLE request_comments IS 'Trao đổi/comment trong phiếu';
COMMENT ON TABLE request_logs IS 'Log hoạt động của phiếu';
COMMENT ON TABLE attachments IS 'Tệp đính kèm';
COMMENT ON TABLE auth_logs IS 'Log đăng nhập hệ thống';
COMMENT ON TABLE categories IS 'Danh mục/Nhóm việc';
COMMENT ON TABLE rate_limits IS 'Tracks API rate limits per user/action to prevent spam (PRD Section 3.2)';
COMMENT ON TABLE cron_logs IS 'Tracks cron job executions for idempotency (PRD Section 3.7)';
COMMENT ON COLUMN requests.unit_name_snapshot IS 'Snapshot tên đơn vị tại thời điểm tạo phiếu';
COMMENT ON COLUMN attachments.temp_token IS 'Token tạm cho file upload trước khi submit phiếu';
COMMENT ON COLUMN request_comments.is_internal IS 'Comment nội bộ chỉ Admin/Manager/Staff thấy';
COMMENT ON COLUMN requests.completion_note IS 'Required when status = DONE (enforced in app)';
COMMENT ON COLUMN requests.cancel_reason IS 'Required when status = CANCELLED (enforced in app)';
COMMENT ON COLUMN requests.version IS 'Optimistic locking: increment on each update (PRD Section 3.3.4)';
COMMENT ON FUNCTION check_and_increment_rate_limit IS 'Check and increment rate limit counter. Returns {allowed, current_count, reset_at}. Default limit: 5 req/min (PRD Section 3.2).';
COMMENT ON FUNCTION update_request_with_locking IS 'Update request with version check for optimistic locking. Returns {success, new_version, error_message} (PRD Section 3.3.4).';
COMMENT ON FUNCTION create_request_atomic IS 'Create request with items atomically in a single transaction. Returns {success, request_id, error_message}. Ensures data integrity per PRD Section 3.3.4.';
COMMENT ON FUNCTION update_request_atomic IS 'Update request with items atomically using optimistic locking. Returns {success, new_version, error_message}. Ensures data integrity per PRD Section 3.3.4.';
