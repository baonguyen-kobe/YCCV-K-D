# 🚀 Supabase Setup Guide - Chi tiết từng bước

> **Thời gian:** ~10-15 phút

---

## 📋 Bước 1: Tạo Supabase Account & Project

### 1.1 Đăng ký Supabase
- Vào https://supabase.com
- Click **"Sign Up"** hoặc **"Start for free"**
- Chọn đăng ký với GitHub hoặc Email
- Xác nhận email

### 1.2 Tạo Project
1. Vào Dashboard sau khi login
2. Click **"New Project"**
3. Điền thông tin:
   ```
   Name:         yccv-dev
   Database:     Tạo mới
   Password:     [Tạo password mạnh - LƯU LẠI!]
   Region:       Southeast Asia (Singapore)
   ```
4. Click **"Create new project"** → Chờ 1-2 phút

---

## 🔑 Bước 2: Lấy Credentials

Sau khi project được tạo:

1. Vào **Settings > API** (menu bên trái)
2. Tìm section **"Project API keys"**
3. Copy và lưu lại 3 values:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## 🗄️ Bước 3: Chạy Database Migration

### 3.1 Mở SQL Editor
1. Vào **SQL Editor** (menu bên trái)
2. Click **"New Query"**

### 3.2 Copy & Paste Migration
1. Mở file: `d:\YCCV\yccv-app\supabase\migrations\0001_init.sql`
2. Copy **toàn bộ nội dung**
3. Paste vào SQL Editor
4. Click **"Run"** (hoặc Ctrl+Enter)
5. Chờ tới khi thấy: `✓ Success`

---

## 👥 Bước 4: Tạo Auth Users

### 4.1 Tạo qua SQL (Recommended - nhanh)

1. SQL Editor → **"New Query"**
2. Copy script dưới đây:

```sql
-- ============================================================
-- CREATE AUTH USERS FOR DEV
-- ============================================================

-- Admin
INSERT INTO auth.users (
  id, instance_id, aud, role, email, 
  encrypted_password, email_confirmed_at, 
  created_at, updated_at, confirmation_token,
  raw_app_meta_data, raw_user_meta_data
)
VALUES 
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

3. Click **"Run"**
4. Chờ tới khi thấy: `✓ Success`

---

## 🌱 Bước 5: Chạy Seed Data

### 5.1 SQL Editor → New Query

1. Mở file: `d:\YCCV\yccv-app\supabase\seed_dev.sql`
2. Copy **toàn bộ nội dung**
3. Paste vào SQL Editor
4. Click **"Run"**
5. Chờ tới khi thấy: `✓ Success`

### 5.2 Verify dữ liệu

Chạy query này để xác nhận:

```sql
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL SELECT 'Requests', COUNT(*) FROM requests
UNION ALL SELECT 'Request Items', COUNT(*) FROM request_items;
```

Kết quả mong đợi:
```
Users:         9
Requests:      15
Request Items: 22+
```

---

## 🔐 Bước 6: Update .env.local

### 6.1 Mở file `.env.local`

Đường dẫn: `d:\YCCV\yccv-app\.env.local`

### 6.2 Thay thế giá trị

```env
# Từ Supabase Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

# Giữ nguyên những cái khác
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=YCCV - Hệ thống Yêu cầu Công việc
RESEND_API_KEY=re_placeholder_key
EMAIL_FROM=noreply@eiu.edu.vn
CRON_SECRET=dev-cron-secret-123
```

**⚠️ LƯU Ý:** Thay `YOUR_PROJECT_ID` bằng project ID thực tế (ví dụ: `xyzabc123`)

---

## ✅ Bước 7: Restart Dev Server & Test Login

### 7.1 Restart dev server

```powershell
# Trong terminal, bấm Ctrl+C để stop
# Sau đó chạy lại:
npm run dev
```

### 7.2 Test login

1. Mở http://localhost:3000/login
2. Dùng tài khoản test:
   ```
   Email:    admin@eiu.edu.vn
   Password: Admin@123
   ```
3. Nếu login thành công → Redirect đến `/dashboard` ✅

---

## 🔍 Troubleshooting

### ❌ Login báo "Invalid credentials"
- **Nguyên nhân:** Chưa tạo auth users hoặc password sai
- **Fix:** Chạy lại script tạo auth users (Bước 4)

### ❌ "Relation does not exist"
- **Nguyên nhân:** Chưa chạy migration
- **Fix:** Chạy lại `0001_init.sql` (Bước 3)

### ❌ ".env.local not loaded"
- **Nguyên nhân:** Restart dev server sau khi update .env.local
- **Fix:** Ctrl+C → `npm run dev`

### ❌ "Cannot read properties of undefined"
- **Nguyên nhân:** Supabase credentials sai format
- **Fix:** Kiểm tra lại credentials từ Settings > API

---

## 📝 Checklist

- [ ] Tạo Supabase project
- [ ] Copy credentials vào `.env.local`
- [ ] Chạy migration `0001_init.sql`
- [ ] Tạo auth users (SQL script)
- [ ] Chạy seed data `seed_dev.sql`
- [ ] Restart dev server
- [ ] Test login với `admin@eiu.edu.vn`
- [ ] Có thể xem `/requests` sau login ✅

---

**Sau khi hoàn tất:** App sẽ hoạt động đầy đủ với 15 phiếu test!

Gọi tôi khi cần help! 🚀
