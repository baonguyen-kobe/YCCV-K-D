# Quick RLS Fix Instructions

## Problem
The app is showing "permission denied for table requests" because RLS policies are not properly configured.

## Solution - Run This in Supabase SQL Editor

### Step 1: Open Supabase Console
1. Go to https://supabase.com
2. Select project `gpqtsspvskqtlsfsrame`
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Copy and Paste
Copy ALL the SQL below and paste into Supabase SQL Editor:

```sql
-- Enable RLS with authenticated user access

-- First, enable RLS on all tables
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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to read request_items" ON request_items;
DROP POLICY IF EXISTS "Allow authenticated users to read request_comments" ON request_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read attachments" ON attachments;
DROP POLICY IF EXISTS "Allow authenticated users to read request_logs" ON request_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to read units" ON units;

-- Create new policies for requests
CREATE POLICY "Allow authenticated users to read requests" ON requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert requests" ON requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update requests" ON requests
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for request_items
CREATE POLICY "Allow authenticated users to read request_items" ON request_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert request_items" ON request_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for request_comments
CREATE POLICY "Allow authenticated users to read request_comments" ON request_comments
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert request_comments" ON request_comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for attachments
CREATE POLICY "Allow authenticated users to read attachments" ON attachments
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert attachments" ON attachments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for request_logs
CREATE POLICY "Allow authenticated users to read request_logs" ON request_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert request_logs" ON request_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for users
CREATE POLICY "Allow authenticated users to read users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert users" ON users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update users" ON users
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for categories
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert categories" ON categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for units
CREATE POLICY "Allow authenticated users to read units" ON units
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### Step 3: Execute
1. Click **Run** button (or press Ctrl+Enter)
2. Wait for "Executed successfully" message
3. ✅ Done!

### Step 4: Refresh Browser
1. Go back to http://localhost:3001/dashboard
2. Refresh page (Ctrl+R)
3. "permission denied for table requests" should be gone ✅

## What This Does
- Enables RLS (Row Level Security) on all tables
- Allows any authenticated user to read/write to all tables
- This is a simple permission model - all logged-in users can see all data
- In production, you may want more restrictive policies based on roles/units

## If It Still Doesn't Work
Check the browser console (F12) for errors and let me know what it says.
