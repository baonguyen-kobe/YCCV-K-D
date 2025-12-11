# Quick Start Guide - Google OAuth Only

**Estimated Time**: 45 phút  
**Last Updated**: 2025-12-11  
**Authentication**: Google OAuth + Email Whitelist

---

## ⚠️ QUAN TRỌNG

Ứng dụng này sử dụng **Google OAuth ONLY** - không có email/password login!
- ✅ User login bằng Google account
- ✅ Email được kiểm tra với whitelist trong database
- ✅ Profile tự động tạo từ Google metadata

**Xem hướng dẫn đầy đủ**: [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📋 CHECKLIST NHANH

- [ ] Bước 1: Setup Supabase Database (15 phút)
- [ ] Bước 2: Configure Google OAuth (15 phút)
- [ ] Bước 3: Test Local (10 phút)
- [ ] Bước 4: Deploy Production (Optional - 15 phút)

---

## BƯỚC 1: SETUP SUPABASE DATABASE

### 1.1 Tạo Project
1. Vào https://supabase.com → **New Project**
2. **Name**: `yccv-production`
3. **Database Password**: Tạo password mạnh
4. **Region**: `Southeast Asia (Singapore)`
5. Click **Create** → Đợi 2 phút

### 1.2 Lấy API Keys
1. **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhb...`
   - **service_role key**: `eyJhb...` (click Reveal)

### 1.3 Tạo `.env.local`
```bash
cd d:\YCCV\yccv-app
```

Tạo file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 1.4 Run Migrations

**Step A: Schema** (Supabase SQL Editor)
```sql
-- Copy từ: supabase/migrations/0001_init.sql
-- Paste vào SQL Editor → Run
-- ✅ Expected: 10 tables created
```

**Step B: RLS Policies** (Supabase SQL Editor)
```sql
-- Copy từ: supabase/enable_rls_authenticated.sql
-- Paste vào SQL Editor → Run
-- ✅ Expected: RLS enabled on all tables
```

**Step C: Seed Data** (Supabase SQL Editor)
```sql
-- Copy từ: supabase/seed_complete.sql
-- Paste vào SQL Editor → Run
-- ✅ Expected: 9 whitelist users, roles, sample data
```

### 1.5 Tạo Storage Bucket
1. **Storage** → **Create bucket**
2. **Name**: `request-attachments`
3. **Public**: OFF
4. Add 3 policies (xem [SETUP_GUIDE.md](SETUP_GUIDE.md) section 2.4)

**✅ DONE**: Database ready!

---

## BƯỚC 2: CONFIGURE GOOGLE OAUTH

### 2.1 Google Cloud Console
1. Vào https://console.cloud.google.com
2. **New Project** → Name: `EIU Job Requests`
3. **APIs & Services** → **OAuth consent screen**
   - App name: `EIU Job Request System`
   - User support email: `your-email@eiu.edu.vn`
4. **Credentials** → **Create OAuth Client ID**
   - Type: Web application
   - Name: `Supabase Auth`
   - **Authorized JavaScript origins**:
     ```
     https://xxxxx.supabase.co
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
5. **Copy Client ID & Secret**

### 2.2 Enable trong Supabase
1. **Authentication** → **Providers** → **Google**
2. Toggle **ON**
3. Paste **Client ID** & **Client Secret**
4. **Save**

### 2.3 Update URLs
1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```
4. **Save**

**✅ DONE**: OAuth configured!

---

## BƯỚC 3: TEST LOCAL

### 3.1 Run App
```bash
cd d:\YCCV\yccv-app
npm install
npm run dev
```

### 3.2 Test Google OAuth
1. Mở http://localhost:3000
2. Click **"Đăng nhập với Google"**
3. Chọn email **có trong whitelist** (e.g., `admin@eiu.edu.vn`)
4. ✅ Redirect → `/dashboard`

### 3.3 Test Whitelist Block
1. Logout
2. Login với email **KHÔNG trong whitelist**
3. ✅ Thấy error: "Người dùng không được phép truy cập"

### 3.4 Test Features
- ✅ `/dashboard` - Overview
- ✅ `/requests` - Danh sách phiếu
- ✅ `/requests/create` - Tạo phiếu mới
- ✅ `/admin/users` - Quản lý users (Admin only)

**✅ DONE**: Local testing complete!

---

## BƯỚC 4: DEPLOY PRODUCTION (OPTIONAL)

### 4.1 Push to GitHub
```bash
git add .
git commit -m "feat: Google OAuth with whitelist"
git push origin main
```

### 4.2 Deploy Vercel
1. https://vercel.com → **New Project**
2. Import repo `YCCV`
3. **Root Directory**: `yccv-app`
4. **Deploy** (will fail)

### 4.3 Add Environment Variables
Vercel **Settings** → **Environment Variables**:
```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

### 4.4 Update OAuth URLs
1. Copy production URL: `https://yccv-xxx.vercel.app`
2. **Google Cloud Console** → Add to Authorized origins/redirects
3. **Supabase** → Update Site URL & Redirect URLs

**✅ DONE**: Production deployed!

---

## 🎉 SUCCESS!

App đã ready với Google OAuth + Whitelist!

### Quản lý Whitelist

**Thêm user mới**:
```sql
-- Supabase SQL Editor
INSERT INTO users (email, is_active, unit_id, full_name)
VALUES ('newuser@eiu.edu.vn', true, 'unit-uuid', 'Họ Tên');

-- Assign role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'newuser@eiu.edu.vn' AND r.name = 'user';
```

**Vô hiệu hóa**:
```sql
UPDATE users SET is_active = false WHERE email = 'user@eiu.edu.vn';
```

---

## 🆘 TROUBLESHOOTING

### "Permission denied for table requests"
→ Run [enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql)

### "Người dùng không được phép truy cập"
→ Check: `SELECT * FROM users WHERE email = 'xxx@eiu.edu.vn';`
→ Verify: `is_active = true`

### "redirect_uri_mismatch"
→ Check Google Cloud Console redirect URIs

### Profile không tự động tạo
→ Check [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts)

---

## 📚 TÀI LIỆU

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Chi tiết đầy đủ
- **[WHITELIST_SETUP.md](WHITELIST_SETUP.md)** - Quản lý whitelist
- **[OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md)** - Google OAuth chi tiết
- **[RLS_FIX_QUICK.md](RLS_FIX_QUICK.md)** - Fix lỗi nhanh

**Chúc thành công! 🚀**
