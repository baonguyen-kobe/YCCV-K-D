-- ============================================================
-- Enable RLS with authenticated user access
-- ============================================================

-- Set authenticated users to have full access to tables
-- This allows any authenticated user to read/write to these tables

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
-- CREATE POLICIES FOR units
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read units" ON units;
CREATE POLICY "Allow authenticated users to read units" ON units
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert units" ON units;
CREATE POLICY "Allow authenticated users to insert units" ON units
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update units" ON units;
CREATE POLICY "Allow authenticated users to update units" ON units
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete units" ON units;
CREATE POLICY "Allow authenticated users to delete units" ON units
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR users
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow authenticated users to read users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON users;
CREATE POLICY "Allow authenticated users to insert users" ON users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
CREATE POLICY "Allow authenticated users to update users" ON users
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR roles
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON roles;
CREATE POLICY "Allow authenticated users to read roles" ON roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR user_roles
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON user_roles;
CREATE POLICY "Allow authenticated users to read user_roles" ON user_roles
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert user_roles" ON user_roles;
CREATE POLICY "Allow authenticated users to insert user_roles" ON user_roles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR categories
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
CREATE POLICY "Allow authenticated users to insert categories" ON categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR requests
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read requests" ON requests;
CREATE POLICY "Allow authenticated users to read requests" ON requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON requests;
CREATE POLICY "Allow authenticated users to insert requests" ON requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update requests" ON requests;
CREATE POLICY "Allow authenticated users to update requests" ON requests
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete requests" ON requests;
CREATE POLICY "Allow authenticated users to delete requests" ON requests
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR request_items
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read request_items" ON request_items;
CREATE POLICY "Allow authenticated users to read request_items" ON request_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert request_items" ON request_items;
CREATE POLICY "Allow authenticated users to insert request_items" ON request_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update request_items" ON request_items;
CREATE POLICY "Allow authenticated users to update request_items" ON request_items
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR request_comments
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read request_comments" ON request_comments;
CREATE POLICY "Allow authenticated users to read request_comments" ON request_comments
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert request_comments" ON request_comments;
CREATE POLICY "Allow authenticated users to insert request_comments" ON request_comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR attachments
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read attachments" ON attachments;
CREATE POLICY "Allow authenticated users to read attachments" ON attachments
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert attachments" ON attachments;
CREATE POLICY "Allow authenticated users to insert attachments" ON attachments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CREATE POLICIES FOR request_logs
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to read request_logs" ON request_logs;
CREATE POLICY "Allow authenticated users to read request_logs" ON request_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert request_logs" ON request_logs;
CREATE POLICY "Allow authenticated users to insert request_logs" ON request_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
