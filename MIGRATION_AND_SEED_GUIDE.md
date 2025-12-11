# 📚 Hướng dẫn Migration & Seed Data

> **⚠️ QUAN TRỌNG:** Chỉ chạy seed data trên môi trường **DEV**. KHÔNG chạy trên PRODUCTION!

---

## 📋 Mục lục

1. [Prerequisites](#1-prerequisites)
2. [Setup Supabase Project](#2-setup-supabase-project)
3. [Chạy Migration](#3-chạy-migration)
4. [Tạo Auth Users](#4-tạo-auth-users)
5. [Chạy Seed Data](#5-chạy-seed-data)
6. [Xác nhận dữ liệu](#6-xác-nhận-dữ-liệu)
7. [Test Accounts](#7-test-accounts)
8. [Reset Data](#8-reset-data)

---

## 1. Prerequisites

- [ ] Tài khoản Supabase (https://supabase.com)
- [ ] Supabase CLI (optional): `npm install -g supabase`
- [ ] Project DEV đã được tạo trên Supabase

---

## 2. Setup Supabase Project

### 2.1 Tạo project mới

1. Vào https://app.supabase.com
2. Click **"New Project"**
3. Đặt tên project: `yccv-dev`
4. Chọn Region: **Southeast Asia (Singapore)** (gần nhất)
5. Tạo database password (lưu lại!)
6. Click **"Create new project"**

### 2.2 Lấy credentials

Sau khi project được tạo, vào **Settings > API**:

```env
# Copy vào file .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # Chỉ dùng server-side
```

---

## 3. Chạy Migration

### Option A: Qua Supabase Dashboard (Recommended cho lần đầu)

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **"New Query"**
3. Copy toàn bộ nội dung file `supabase/migrations/0001_init.sql`
4. Paste vào editor
5. Click **"Run"** (hoặc Ctrl+Enter)
6. Kiểm tra output không có lỗi

### Option B: Qua Supabase CLI

```bash
# Link project
npx supabase link --project-ref <your-project-ref>

# Push migration
npx supabase db push
```

### Xác nhận migration thành công

Vào **Table Editor**, kiểm tra các bảng đã được tạo:
- `units` ✓
- `roles` (4 records: admin, manager, staff, user) ✓
- `users` ✓
- `user_roles` ✓
- `categories` (4 records) ✓
- `requests` ✓
- `request_items` ✓
- `request_comments` ✓
- `attachments` ✓
- `request_logs` ✓
- `auth_logs` ✓

---

## 4. Tạo Auth Users

**⚠️ QUAN TRỌNG:** Phải tạo Auth Users TRƯỚC khi chạy seed!

Seed SQL sẽ insert vào bảng `public.users` với các UUID cố định. Các UUID này cần tồn tại trong `auth.users` trước.

### Option A: Tạo thủ công qua Dashboard

1. Vào **Authentication > Users**
2. Click **"Add user" > "Create new user"**
3. Tạo từng user với thông tin sau:

| Email | Password | User UID (Important!) |
|-------|----------|----------------------|
| `admin@eiu.edu.vn` | `Admin@123` | `00000000-0000-0000-0001-000000000001` |
| `manager01@eiu.edu.vn` | `Manager@123` | `00000000-0000-0000-0001-000000000002` |
| `manager02@eiu.edu.vn` | `Manager@123` | `00000000-0000-0000-0001-000000000003` |
| `staff01@eiu.edu.vn` | `Staff@123` | `00000000-0000-0000-0001-000000000004` |
| `staff02@eiu.edu.vn` | `Staff@123` | `00000000-0000-0000-0001-000000000005` |
| `lecturer01@eiu.edu.vn` | `User@123` | `00000000-0000-0000-0001-000000000006` |
| `lecturer02@eiu.edu.vn` | `User@123` | `00000000-0000-0000-0001-000000000007` |
| `lecturer03@eiu.edu.vn` | `User@123` | `00000000-0000-0000-0001-000000000008` |
| `multiuser@eiu.edu.vn` | `Multi@123` | `00000000-0000-0000-0001-000000000009` |

**Lưu ý:** Khi tạo user qua Dashboard, Supabase sẽ tự generate UUID. Bạn cần update UUID trong SQL Editor:

```sql
-- Cập nhật UUID cho từng user (ví dụ)
UPDATE auth.users SET id = '00000000-0000-0000-0001-000000000001' WHERE email = 'admin@eiu.edu.vn';
-- ... tương tự cho các user khác
```

### Option B: Tạo qua SQL (Nhanh hơn)

Chạy script này trong **SQL Editor**:

```sql
-- ============================================================
-- CREATE AUTH USERS (Chạy TRƯỚC seed_dev.sql)
-- ============================================================

-- Insert auth users với fixed UUIDs
INSERT INTO auth.users (
  id, instance_id, aud, role, email, 
  encrypted_password, email_confirmed_at, 
  created_at, updated_at, confirmation_token,
  raw_app_meta_data, raw_user_meta_data
)
VALUES 
  -- Admin
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000000', 
   'authenticated', 'authenticated', 'admin@eiu.edu.vn',
   crypt('Admin@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nguyễn Admin"}'),
  
  -- Manager 1
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager01@eiu.edu.vn',
   crypt('Manager@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Trần Quản Lý"}'),
  
  -- Manager 2
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager02@eiu.edu.vn',
   crypt('Manager@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Phạm Quản Lý"}'),
  
  -- Staff 1
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff01@eiu.edu.vn',
   crypt('Staff@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Lê Chuyên Viên"}'),
  
  -- Staff 2
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff02@eiu.edu.vn',
   crypt('Staff@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Hoàng Chuyên Viên"}'),
  
  -- Lecturer 1
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer01@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Võ Giảng Viên"}'),
  
  -- Lecturer 2
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer02@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Đặng Giảng Viên"}'),
  
  -- Lecturer 3
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'lecturer03@eiu.edu.vn',
   crypt('User@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Bùi Trợ Giảng"}'),
  
  -- Multi-role user
  ('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'multiuser@eiu.edu.vn',
   crypt('Multi@123', gen_salt('bf')), NOW(), NOW(), NOW(), '',
   '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ngô Đa Vai"}')

ON CONFLICT (id) DO NOTHING;

-- Insert identities cho email provider
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  id, id, 
  jsonb_build_object('sub', id::text, 'email', email),
  'email', id::text,
  NOW(), NOW(), NOW()
FROM auth.users
WHERE email LIKE '%@eiu.edu.vn'
ON CONFLICT (provider, provider_id) DO NOTHING;
```

---

## 5. Chạy Seed Data

### Qua Supabase Dashboard

1. Vào **SQL Editor**
2. Click **"New Query"**
3. Copy toàn bộ nội dung file `supabase/seed_dev.sql`
4. Paste vào editor
5. Click **"Run"**
6. Kiểm tra output: `Success. No rows returned` là OK

### Qua Supabase CLI (nếu đã link project)

```bash
# Chạy từ thư mục project
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f supabase/seed_dev.sql
```

---

## 6. Xác nhận dữ liệu

Chạy query này trong SQL Editor để verify:

```sql
-- Thống kê tổng quan
SELECT 'Units' as entity, COUNT(*) as count FROM units
UNION ALL SELECT 'Categories', COUNT(*) FROM categories
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'Requests', COUNT(*) FROM requests
UNION ALL SELECT 'Request Items', COUNT(*) FROM request_items
UNION ALL SELECT 'Comments', COUNT(*) FROM request_comments
UNION ALL SELECT 'Attachments', COUNT(*) FROM attachments
UNION ALL SELECT 'Request Logs', COUNT(*) FROM request_logs;
```

**Kết quả mong đợi:**

| entity | count |
|--------|-------|
| Units | 3 |
| Categories | 6 |
| Users | 9 |
| User Roles | 10 |
| Requests | 15 |
| Request Items | 22 |
| Comments | 10 |
| Attachments | 5 |
| Request Logs | 6+ |

### Kiểm tra phân bố status:

```sql
SELECT status, COUNT(*) as count 
FROM requests 
GROUP BY status 
ORDER BY status;
```

**Kết quả mong đợi:**

| status | count |
|--------|-------|
| ASSIGNED | 3 |
| CANCELLED | 1 |
| DONE | 2 |
| DRAFT | 2 |
| IN_PROGRESS | 3 |
| NEED_INFO | 2 |
| NEW | 2 |

### Kiểm tra user roles:

```sql
SELECT u.email, array_agg(r.name) as roles 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
GROUP BY u.email 
ORDER BY u.email;
```

---

## 7. Test Accounts

### Tài khoản để đăng nhập test

| Role | Email | Password | Có thể test |
|------|-------|----------|-------------|
| **Admin** | `admin@eiu.edu.vn` | `Admin@123` | Full access, quản lý users |
| **Manager** | `manager01@eiu.edu.vn` | `Manager@123` | Tiếp nhận, assign, duyệt phiếu |
| **Staff** | `staff01@eiu.edu.vn` | `Staff@123` | Xử lý phiếu được assign |
| **User** | `lecturer01@eiu.edu.vn` | `User@123` | Tạo & theo dõi phiếu |
| **Multi-role** | `multiuser@eiu.edu.vn` | `Multi@123` | Manager + Staff permissions |

### Test Scenarios

1. **Login** với từng role → Verify UI elements hiển thị đúng quyền
2. **Lecturer01** có nhiều phiếu → Test list view & filters
3. **Staff01** có nhiều phiếu assigned → Test workflow
4. **NEED_INFO requests** (REQ-011, REQ-012) → Test comment flow
5. **DONE requests** (REQ-013, REQ-014) → Test completed view
6. **Internal comments** → Verify chỉ Admin/Manager/Staff thấy

---

## 8. Reset Data

Nếu cần reset toàn bộ seed data:

```sql
-- ⚠️ CẢNH BÁO: Xoá toàn bộ dữ liệu!
-- Chỉ chạy trên DEV!

-- Xoá data theo thứ tự (respect FK constraints)
TRUNCATE request_logs CASCADE;
TRUNCATE request_comments CASCADE;
TRUNCATE attachments CASCADE;
TRUNCATE request_items CASCADE;
TRUNCATE requests CASCADE;
TRUNCATE user_roles CASCADE;
TRUNCATE users CASCADE;
-- Không truncate: units, roles, categories (seed lại từ migration)

-- Sau đó chạy lại seed_dev.sql
```

### Reset Auth Users (nếu cần)

```sql
-- Xoá auth users (email @eiu.edu.vn)
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@eiu.edu.vn'
);
DELETE FROM auth.users WHERE email LIKE '%@eiu.edu.vn';

-- Sau đó chạy lại script tạo auth users (Section 4)
```

---

## 🔄 Quick Reference

```bash
# Thứ tự chạy:
1. Migration:     0001_init.sql          # Schema + base data
2. Auth Users:    Script SQL Section 4   # Tạo auth.users
3. Seed Data:     seed_dev.sql           # Mock data cho DEV
```

---

**Cập nhật lần cuối:** 2025-12-11
