# 🔐 Whitelist Setup Guide for Google OAuth

Hướng dẫn thiết lập whitelist cho ứng dụng YCCV khi dùng **Google OAuth chỉ**.

---

## 📋 Overview

Ứng dụng YCCV sử dụng:
- **Authentication**: Google OAuth (không email/password)
- **Whitelist**: Danh sách email được phép truy cập trong bảng `public.users`
- **Auto-create profile**: Profile tự động tạo từ Google metadata khi đăng nhập lần đầu

---

## 🔧 Setup Steps

### 1. Chạy Migration (Lần Đầu)

1. Vào Supabase SQL Editor
2. Copy nội dung từ [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)
3. Paste vào SQL Editor → Click **Run**

✅ Lệnh này tạo toàn bộ database schema

### 2. Enable RLS Policies

1. Vào Supabase SQL Editor
2. Copy nội dung từ [supabase/enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql)
3. Paste vào SQL Editor → Click **Run**

✅ Lệnh này cho phép authenticated users truy cập dữ liệu

### 3. Seed Whitelist Users & Test Data

1. Vào Supabase SQL Editor
2. Copy nội dung từ [supabase/seed_complete.sql](supabase/seed_complete.sql)
3. Paste vào SQL Editor → Click **Run**

✅ Lệnh này tạo:
- Danh sách email whitelist
- Roles (admin, manager, staff, user)
- Sample categories & requests (để test)

### 4. Cấu Hình Google OAuth

1. Vào Supabase → **Authentication** → **Providers**
2. Tìm **Google** → Click **Enable**
3. Nhập Google OAuth credentials (từ Google Cloud Console)
4. Set Redirect URL: `http://localhost:3000/auth/callback` (hoặc domain production)

### 5. Tạo `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://gpqtsspvskqtlsfsrame.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Run Ứng Dụng

```bash
cd yccv-app
npm install
npm run dev
```

Truy cập: http://localhost:3000

---

## 👥 Whitelist Management

### Thêm Email Vào Whitelist

**Option A: Supabase Console (GUI)**
1. Vào Supabase → **SQL Editor**
2. Chạy:

```sql
INSERT INTO public.users (
  email,
  is_active,
  unit_id,
  full_name,
  phone
) VALUES (
  'newemail@eiu.edu.vn',
  true,
  'unit-uuid-here',
  'Họ và Tên',
  '+84-123-456-789'
);
```

**Option B: Programmatically (via API)**
- Yêu cầu admin API endpoint để thêm users
- (Chưa implement - có thể thêm admin panel sau)

### Vô Hiệu Hóa User

```sql
UPDATE public.users
SET is_active = false
WHERE email = 'user@eiu.edu.vn';
```

### Xem Danh Sách Whitelist

```sql
SELECT email, full_name, unit_id, is_active, created_at
FROM public.users
ORDER BY created_at DESC;
```

---

## 🔄 How It Works

### Authentication Flow

```
1. User clicks "Đăng nhập với Google" on /login page
   ↓
2. Redirect to Google OAuth consent screen
   ↓
3. User grants permission, Google redirects to /auth/callback
   ↓
4. Callback handler (src/app/auth/callback/route.ts) does:
   a) Get user from Google OAuth
   b) Check if email exists in public.users whitelist
   c) Check if is_active = true
   d) If NOT whitelisted → Sign out & show error on /login?error=not_whitelisted
   e) If whitelisted → Auto-create/update user profile in public.users
   f) Set session cookie & redirect to /dashboard
```

---

## 📊 Database Structure

### users Table (Whitelist)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key (set by OAuth callback) |
| email | Text | User's email (checked during login) |
| full_name | Text | User's full name (from Google) |
| phone | Text | User's phone number |
| unit_id | UUID | User's unit/department |
| is_active | Boolean | Whitelist status (must be true to login) |
| created_at | Timestamp | When added to whitelist |
| updated_at | Timestamp | When profile was last updated |

### Sample Whitelist Data

```sql
-- From seed_complete.sql
admin@eiu.edu.vn        -- Admin
manager01@eiu.edu.vn    -- Manager
staff01@eiu.edu.vn      -- Staff
lecturer01@eiu.edu.vn   -- Lecturer/User
```

---

## 🧪 Testing

### Test with Local Users (Seed Data)

Sau khi chạy `seed_complete.sql`, có thể test login bằng:

| Email | Full Name | Role |
|-------|-----------|------|
| admin@eiu.edu.vn | Nguyễn Admin | Admin |
| manager01@eiu.edu.vn | Trần Quản Lý | Manager |
| staff01@eiu.edu.vn | Lê Chuyên Viên | Staff |
| lecturer01@eiu.edu.vn | Võ Giảng Viên | Lecturer |

**Note**: Chỉ có thể login bằng Google OAuth (email must be associated với Google account)

### Test Whitelist Denial

1. Thêm email NOT in whitelist vào `public.users` với `is_active = false`
2. Cố gắng login với email đó
3. Expected: Lỗi "Not whitelisted" trên /login?error=not_whitelisted

---

## 🛡️ Security Notes

### RLS Policies
- Tất cả authenticated users có thể read/write trên tables
- Trong production, có thể restrict hơn dựa theo roles
- Hiện tại, simple model: whitelist + roles = permission

### Email Whitelist
- Whitelist check diễn ra ở **callback handler** (server-side)
- Không thể bypass bằng client-side manipulation
- Nếu user không in whitelist → sign out immediately

### Google OAuth
- Credentials lưu trong Supabase (không in code)
- Redirect URL phải khớp với Supabase config
- Token expires và refresh automatically

---

## 🐛 Troubleshooting

### "Người dùng không được phép truy cập"

**Nguyên nhân**: Email không in whitelist hoặc `is_active = false`

**Fix**:
```sql
-- Check if user exists
SELECT * FROM public.users WHERE email = 'user@eiu.edu.vn';

-- If not exists, add them
INSERT INTO public.users (email, is_active, unit_id, full_name)
VALUES ('user@eiu.edu.vn', true, 'unit-uuid', 'Full Name');

-- If exists but inactive, activate
UPDATE public.users SET is_active = true WHERE email = 'user@eiu.edu.vn';
```

### "Permission denied for table requests"

**Nguyên nhân**: RLS policies chưa được enable

**Fix**: Run [supabase/enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql) again

### Google OAuth Button Not Working

**Nguyên nhân**: Google OAuth chưa enable trong Supabase

**Fix**:
1. Vào Supabase → Authentication → Providers
2. Enable Google
3. Nhập Google OAuth credentials
4. Check redirect URL

### "User exists in auth but not in users table"

**Note**: Nếu thấy warning này ở console, bình thường - auth.users khác public.users
- auth.users: Created by Supabase Auth system
- public.users: Whitelist/profile data

---

## 📚 File Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| [0001_init.sql](supabase/migrations/0001_init.sql) | Create schema & tables | First time setup |
| [enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql) | Enable RLS policies | After migration |
| [seed_complete.sql](supabase/seed_complete.sql) | Seed whitelist + test data | Testing locally |
| [OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md) | Detailed Google OAuth guide | Reference |
| [RLS_FIX_QUICK.md](RLS_FIX_QUICK.md) | Quick RLS troubleshooting | If permission denied |

---

## ✅ Checklist

- [ ] Migration 0001_init.sql executed
- [ ] RLS policies enabled (enable_rls_authenticated.sql)
- [ ] Whitelist users seeded (seed_complete.sql)
- [ ] Google OAuth enabled in Supabase
- [ ] `.env.local` configured
- [ ] `npm run dev` running on localhost:3000
- [ ] Can see "Đăng nhập với Google" button on /login
- [ ] Can successfully login with whitelisted email
- [ ] Whitelisted user redirects to /dashboard
- [ ] Non-whitelisted user sees "Not whitelisted" error

---

**Last Updated**: 2025-12-11
**Status**: Production Ready ✅
