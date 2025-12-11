-- ============================================================
-- YCCV - Hệ thống Yêu cầu Công việc
-- Migration: 0001_init.sql
-- Description: Initial database schema
-- Based on PRD v7.0
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- Request Status (PRD Section 3.3.1)
CREATE TYPE request_status AS ENUM (
  'DRAFT',
  'NEW', 
  'ASSIGNED',
  'IN_PROGRESS',
  'NEED_INFO',
  'DONE',
  'CANCELLED'
);

-- Priority Levels (PRD Section 3.2)
CREATE TYPE priority_level AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

-- Attachment Type
CREATE TYPE attachment_type AS ENUM (
  'file',
  'external_url'
);

-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- Units (Đơn vị/Khoa)
-- ------------------------------------------------------------
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE, -- ASSUMPTION: Short code for unit
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Roles (Vai trò)
-- PRD Section 2.2: admin, manager, staff, user
-- ------------------------------------------------------------
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
  ('admin', 'Quản trị viên', 'Toàn quyền quản trị hệ thống'),
  ('manager', 'Quản lý vận hành', 'Tiếp nhận, phân công, duyệt yêu cầu'),
  ('staff', 'Chuyên viên', 'Nhận và xử lý công việc được giao'),
  ('user', 'Giảng viên', 'Tạo và theo dõi yêu cầu công việc');

-- ------------------------------------------------------------
-- Users (Người dùng)
-- PRD Section 3.1: Whitelist mechanism
-- ------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true, -- Whitelist: only active users can login
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- User Roles (Many-to-Many)
-- PRD Section 2.1: Multi-role support
-- ------------------------------------------------------------
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, role_id)
);

-- ------------------------------------------------------------
-- Categories (Danh mục/Nhóm việc)
-- PRD Section 3.2: subject/category in request_items
-- ------------------------------------------------------------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- ASSUMPTION: Hierarchical categories
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL, -- Category belongs to unit
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Requests (Phiếu yêu cầu)
-- PRD Section 3.2 & 3.3
-- ------------------------------------------------------------
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Auto-generated request number for display
  request_number SERIAL,
  
  -- Content
  reason TEXT NOT NULL, -- Lý do/Căn cứ (max 500 chars - validated in app)
  priority priority_level DEFAULT 'NORMAL',
  
  -- Status (State Machine)
  status request_status DEFAULT 'DRAFT',
  
  -- Snapshot fields (PRD: preserve at creation time)
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_name_snapshot VARCHAR(255), -- Snapshot of unit name at creation
  
  -- Assignment
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  
  -- Completion/Cancellation
  completion_note TEXT, -- Note when DONE (max 500 chars)
  completed_at TIMESTAMPTZ,
  cancel_reason TEXT, -- Reason when CANCELLED (max 500 chars)
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Tracking
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assignee_id ON requests(assignee_id);
CREATE INDEX idx_requests_unit_id ON requests(unit_id);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- ------------------------------------------------------------
-- Request Items (Chi tiết yêu cầu)
-- PRD Section 3.2: Bảng chi tiết
-- ------------------------------------------------------------
CREATE TABLE request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  -- Content
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  item_name VARCHAR(500) NOT NULL, -- Tên hàng hóa/CV
  unit_count VARCHAR(50), -- ĐVT
  quantity DECIMAL(10, 2) DEFAULT 1,
  required_at DATE, -- Deadline for this item
  link_ref TEXT, -- Link tham khảo
  notes TEXT,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_items_request_id ON request_items(request_id);
CREATE INDEX idx_request_items_required_at ON request_items(required_at);

-- ------------------------------------------------------------
-- Attachments (Tệp đính kèm)
-- PRD Section 3.2: File < 5MB to Storage, >= 5MB external link
-- ------------------------------------------------------------
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  
  -- File info
  file_name VARCHAR(255) NOT NULL,
  file_type attachment_type DEFAULT 'file',
  file_size INTEGER, -- bytes (null for external_url)
  file_url TEXT NOT NULL, -- Storage path or external URL
  mime_type VARCHAR(100),
  
  -- Temp upload tracking (for cleanup)
  temp_token VARCHAR(100), -- Used before request is submitted
  is_attached BOOLEAN DEFAULT false, -- True when attached to submitted request
  
  -- Tracking
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_request_id ON attachments(request_id);
CREATE INDEX idx_attachments_temp_token ON attachments(temp_token) WHERE temp_token IS NOT NULL;

-- ------------------------------------------------------------
-- Request Comments (Trao đổi)
-- PRD Section 3.5
-- ------------------------------------------------------------
CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL, -- Max 1000 chars validated in app
  is_internal BOOLEAN DEFAULT false, -- Internal = only Admin/Manager/Staff can see
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_comments_created_at ON request_comments(created_at);

-- ------------------------------------------------------------
-- Request Logs (Activity Log)
-- PRD Section 3.3: Log all status changes and important actions
-- ------------------------------------------------------------
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action info
  action VARCHAR(100) NOT NULL, -- 'status_change', 'assigned', 'comment_added', etc.
  old_status request_status,
  new_status request_status,
  
  -- Additional data (JSON for flexibility)
  meta_data JSONB, -- { manager_note, reason, changes, etc. }
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_logs_request_id ON request_logs(request_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);

-- ------------------------------------------------------------
-- Auth Logs (Đăng nhập)
-- PRD Section 3.1: Log login attempts
-- ------------------------------------------------------------
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255), -- Store email even if user_id is null (failed attempts)
  
  -- Login info
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  
  -- Tracking
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_logged_at ON auth_logs(logged_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_request_items_updated_at
  BEFORE UPDATE ON request_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_request_comments_updated_at
  BEFORE UPDATE ON request_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to log status changes automatically
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO request_logs (request_id, user_id, action, old_status, new_status, meta_data)
    VALUES (
      NEW.id,
      -- ASSUMPTION: user_id should be passed via app, using created_by as fallback
      COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.created_by),
      'status_change',
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'completion_note', CASE WHEN NEW.status = 'DONE' THEN NEW.completion_note ELSE NULL END,
        'cancel_reason', CASE WHEN NEW.status = 'CANCELLED' THEN NEW.cancel_reason ELSE NULL END
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_request_status_change
  AFTER UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION log_request_status_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- PRD Section 3.4.1: Permission-based access
-- ============================================================

-- Enable RLS on main tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Helper function: Check if user has specific role
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- Helper function: Get user's unit_id
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_unit_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  unit UUID;
BEGIN
  SELECT unit_id INTO unit FROM users WHERE id = user_uuid;
  RETURN unit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- RLS Policies for REQUESTS
-- ------------------------------------------------------------

-- SELECT: Based on PRD Section 3.4.1
CREATE POLICY requests_select ON requests FOR SELECT USING (
  -- Admin can see all
  user_has_role(auth.uid(), 'admin')
  OR
  -- Manager can see requests in their unit
  (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid()))
  OR
  -- Staff can see assigned requests
  (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid())
  OR
  -- Creator can see own requests
  created_by = auth.uid()
);

-- INSERT: Admin, Manager, User can create
CREATE POLICY requests_insert ON requests FOR INSERT WITH CHECK (
  user_has_role(auth.uid(), 'admin')
  OR user_has_role(auth.uid(), 'manager')
  OR user_has_role(auth.uid(), 'user')
);

-- UPDATE: Complex logic - handled more in app layer
-- TODO: Refine policy based on status and role
CREATE POLICY requests_update ON requests FOR UPDATE USING (
  user_has_role(auth.uid(), 'admin')
  OR
  -- Creator can update DRAFT
  (created_by = auth.uid() AND status = 'DRAFT')
  OR
  -- Manager can update unit's requests
  (user_has_role(auth.uid(), 'manager') AND unit_id = get_user_unit_id(auth.uid()))
  OR
  -- Staff can update assigned requests (status changes)
  (user_has_role(auth.uid(), 'staff') AND assignee_id = auth.uid())
);

-- DELETE: Only Admin (soft delete via status preferred)
CREATE POLICY requests_delete ON requests FOR DELETE USING (
  user_has_role(auth.uid(), 'admin')
);

-- ------------------------------------------------------------
-- RLS Policies for REQUEST_ITEMS
-- ------------------------------------------------------------
CREATE POLICY request_items_select ON request_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_items.request_id
  )
);

CREATE POLICY request_items_insert ON request_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (r.created_by = auth.uid() OR user_has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY request_items_update ON request_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (
      user_has_role(auth.uid(), 'admin')
      OR (r.created_by = auth.uid() AND r.status = 'DRAFT')
    )
  )
);

CREATE POLICY request_items_delete ON request_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM requests r 
    WHERE r.id = request_items.request_id 
    AND (
      user_has_role(auth.uid(), 'admin')
      OR (r.created_by = auth.uid() AND r.status = 'DRAFT')
    )
  )
);

-- ------------------------------------------------------------
-- RLS Policies for REQUEST_COMMENTS
-- ------------------------------------------------------------

-- SELECT: Can view if can view request, internal comments restricted
CREATE POLICY request_comments_select ON request_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_comments.request_id
  )
  AND (
    -- Non-internal comments visible to all who can see request
    is_internal = false
    OR
    -- Internal comments only for admin/manager/staff
    user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'manager')
    OR user_has_role(auth.uid(), 'staff')
  )
);

-- INSERT: Anyone who can view request can comment
CREATE POLICY request_comments_insert ON request_comments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_comments.request_id
  )
  AND user_id = auth.uid()
  AND (
    -- Only admin/manager/staff can create internal comments
    is_internal = false
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'manager')
    OR user_has_role(auth.uid(), 'staff')
  )
);

-- ------------------------------------------------------------
-- RLS Policies for ATTACHMENTS
-- ------------------------------------------------------------
CREATE POLICY attachments_select ON attachments FOR SELECT USING (
  -- Can view if can view the request
  request_id IS NULL -- Temp uploads
  OR EXISTS (
    SELECT 1 FROM requests r WHERE r.id = attachments.request_id
  )
);

CREATE POLICY attachments_insert ON attachments FOR INSERT WITH CHECK (
  uploaded_by = auth.uid()
);

CREATE POLICY attachments_delete ON attachments FOR DELETE USING (
  user_has_role(auth.uid(), 'admin')
  OR uploaded_by = auth.uid()
);

-- ------------------------------------------------------------
-- RLS Policies for REQUEST_LOGS
-- ------------------------------------------------------------
CREATE POLICY request_logs_select ON request_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_logs.request_id
  )
);

-- Logs are created by triggers/system, not directly by users
CREATE POLICY request_logs_insert ON request_logs FOR INSERT WITH CHECK (
  true -- Controlled by application
);

-- ------------------------------------------------------------
-- RLS Policies for USERS (limited self-update)
-- ------------------------------------------------------------
CREATE POLICY users_select ON users FOR SELECT USING (
  -- Everyone can see basic user info
  true
);

CREATE POLICY users_update ON users FOR UPDATE USING (
  -- Admin can update anyone
  user_has_role(auth.uid(), 'admin')
  OR
  -- Users can update own profile (limited fields in app)
  id = auth.uid()
);

-- ============================================================
-- SEED DATA (Optional - for development)
-- ============================================================

-- Default unit
INSERT INTO units (id, name, code, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Khoa Điều dưỡng', 'NURSING', 'Khoa Điều dưỡng - EIU'),
  ('00000000-0000-0000-0000-000000000002', 'Khoa Y Khoa', 'MEDICINE', 'Khoa Y Khoa - EIU');

-- Default categories
INSERT INTO categories (name, code, unit_id) VALUES
  ('Vật tư y tế', 'MEDICAL_SUPPLIES', '00000000-0000-0000-0000-000000000001'),
  ('Thiết bị giảng dạy', 'TEACHING_EQUIPMENT', '00000000-0000-0000-0000-000000000001'),
  ('Văn phòng phẩm', 'OFFICE_SUPPLIES', NULL),
  ('Khác', 'OTHER', NULL);

-- ============================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================
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

COMMENT ON COLUMN requests.unit_name_snapshot IS 'Snapshot tên đơn vị tại thời điểm tạo phiếu';
COMMENT ON COLUMN attachments.temp_token IS 'Token tạm cho file upload trước khi submit phiếu';
COMMENT ON COLUMN request_comments.is_internal IS 'Comment nội bộ chỉ Admin/Manager/Staff thấy';
