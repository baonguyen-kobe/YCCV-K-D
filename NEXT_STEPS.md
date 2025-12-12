# 🚀 NEXT STEPS - Hướng Dẫn Hoàn Tất Deployment

## ✅ ĐÃ HOÀN THÀNH

- ✅ Git initialized và commit code
- ✅ GitHub push thành công: https://github.com/baonguyen-kobe/YCCV-K-D
- ✅ Secrets sanitized (không có .env committed)
- ✅ Vercel đã được trigger auto-deploy
- ✅ **Supabase Migration chạy thành công** - 12+ bảng dữ liệu đã tạo

---

## 📋 CÒN LẠI (Làm Thủ Công - 30 phút)

### 1️⃣ SUPABASE RLS CONFIGURATION (5 phút)

**⚠️ QUAN TRỌNG:** Đã phát hiện `auth_logs` table không có RLS policies. Bạn cần thêm policies để bảo mật dữ liệu.

#### Bước 1.1: Thêm RLS Policies cho auth_logs

- [ ] Vào **SQL Editor** trong Supabase
- [ ] Click **New query** (tab mới)
- [ ] Copy & paste SQL này:
  ```sql
  CREATE POLICY auth_logs_select ON auth_logs 
  FOR SELECT USING (user_has_role(auth.uid(), 'admin'));
  
  CREATE POLICY auth_logs_insert ON auth_logs 
  FOR INSERT WITH CHECK (true);
  ```
- [ ] Click **Run**
- [ ] Verify: Table Editor → chọn `auth_logs` → Top right có 🔒 badge

#### Bước 1.2: Verify Tất Cả RLS Enabled

- [ ] Go to **Table Editor**
- [ ] Kiểm tra tất cả tables có 🔒 badge:
  - ✅ users
  - ✅ requests
  - ✅ request_items
  - ✅ request_comments
  - ✅ attachments
  - ✅ request_logs
  - ✅ rate_limits
  - ✅ cron_logs
  - ✅ auth_logs (vừa thêm)

---

### 2️⃣ SUPABASE GOOGLE OAUTH SETUP (10 phút)

**Dashboard:** https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl

#### Bước 2.1: Enable Google OAuth Provider

- [ ] Click **Authentication** (left sidebar)
- [ ] Click **Providers**
- [ ] Tìm **Google** → Click vào
- [ ] Toggle **Enabled** ON
- [ ] Lấy credentials từ file `.env.production.local` (file local trên máy bạn):
  ```
  Client ID: [Lấy NEXT_PUBLIC_GOOGLE_CLIENT_ID từ .env.production.local]
  Client Secret: [Lấy GOOGLE_CLIENT_SECRET từ .env.production.local]
  ```
- [ ] Paste vào form
- [ ] Click **Save**

#### Bước 2.2: Configure URL Settings

- [ ] Vẫn trong **Authentication**
- [ ] Click **URL Configuration**
- [ ] **Site URL:**
  ```
  https://yccv-kdd.vercel.app
  ```
- [ ] **Redirect URLs** - Add những URL này:
  ```
  http://localhost:3000/auth/callback
  https://yccv-kdd.vercel.app/auth/callback
  ```
- [ ] Click **Save**

---

### 3️⃣ SUPABASE CREATE ADMIN USER (5 phút)

#### Bước 3.1: Add Admin User Đầu Tiên

- [ ] SQL Editor → **New query**
- [ ] Copy SQL này **(THAY ĐỔI EMAIL):**
  ```sql
  -- 🔴 THAY ĐỔI: 'your-email@gmail.com' thành email Google bạn sẽ dùng login
  
  -- Bước 1: Add user
  INSERT INTO users (id, email, full_name, created_at)
  VALUES (
    gen_random_uuid(),
    'your-email@gmail.com',  -- ⚠️ THAY EMAIL NÀY
    'Admin User',
    now()
  );

  -- Bước 2: Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  SELECT u.id, r.id
  FROM users u
  CROSS JOIN roles r
  WHERE u.email = 'your-email@gmail.com'  -- ⚠️ THAY EMAIL NÀY
    AND r.name = 'admin';

  -- Bước 3: Verify
  SELECT u.email, u.full_name, r.name as role
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE u.email = 'your-email@gmail.com';  -- ⚠️ THAY EMAIL NÀY
  ```
- [ ] **Thay email 3 chỗ** bằng email Google bạn muốn dùng
- [ ] Click **Run**
- [ ] **Expected result:** 1 row với role = 'admin' ✅

---

### 4️⃣ VERCEL DEPLOYMENT CHECK (2 phút)

**Dashboard:** https://vercel.com/baonguyen-kobes-projects/yccv-kdd

- [ ] Check deployment status
  - Nếu **Building**: Đợi 2-3 phút
  - Nếu **Ready**: ✅ Xong rồi
  - Nếu **Error**: Click vào xem logs
- [ ] Click deployment → View logs
- [ ] Kiểm tra **KHÔNG có errors** ❌

---

### 5️⃣ GOOGLE OAUTH VERIFICATION (5 phút)

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

- [ ] Select project: **YCCV App**
- [ ] Click vào **OAuth 2.0 Client ID** đang dùng
- [ ] **Authorized redirect URIs** - Verify có chứa:
  ```
  ✅ https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback
  ✅ https://yccv-kdd.vercel.app/auth/callback
  ✅ http://localhost:3000/auth/callback
  ```
  Nếu thiếu → Click **Add** và **Save**
  
- [ ] **Authorized JavaScript origins** - Verify có chứa:
  ```
  ✅ https://yccv-kdd.vercel.app
  ✅ http://localhost:3000
  ```
  Nếu thiếu → Click **Add** và **Save**

---

### 6️⃣ PRODUCTION TESTING (10 phút)

**URL Production:** https://yccv-kdd.vercel.app

#### Test 1️⃣: Landing Page
- [ ] Mở https://yccv-kdd.vercel.app
- [ ] Should see welcome page
- [ ] Should có button "Sign in with Google"

#### Test 2️⃣: Google Login
- [ ] Click **"Sign in with Google"**
- [ ] Select Google account (email đã add làm admin)
- [ ] Should redirect về dashboard
- [ ] Check browser console (F12 → Console) **KHÔNG có lỗi đỏ** ❌

#### Test 3️⃣: Admin Permissions
- [ ] Dashboard should hiển thị admin menu items
- [ ] Try visit: `https://yccv-kdd.vercel.app/admin/users`
- [ ] Should load admin page (NOT "Unauthorized")

#### Test 4️⃣: Create Request
- [ ] Click **"Create Request"** hoặc visit `/requests/create`
- [ ] Fill form:
  ```
  Reason: "Test request"
  Priority: "Normal"
  Items: Add ít nhất 1 item
  ```
- [ ] Click **Submit**
- [ ] Should success + redirect to requests list

#### Test 5️⃣: Check Logs
- [ ] **Vercel Dashboard** → Logs tab → Look for errors
- [ ] **Supabase Dashboard** → Logs → Look for errors
- [ ] Browser console (F12) → **NO red errors** ✅

---

## 🐛 TROUBLESHOOTING NHANH

### ❌ "OAuth redirect URI mismatch"
```
→ Kiểm tra Google Cloud Console redirect URIs
→ Kiểm tra Supabase Auth URL Configuration
→ Must match EXACTLY (including protocol https:// or http://)
```

### ❌ "User not authorized" / "Unauthorized"
```sql
-- Verify user exists và có admin role
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@gmail.com';

-- Nếu không có kết quả → Re-run admin user creation SQL
```

### ❌ "RLS violation" hoặc "UNAUTHORIZED" errors
```sql
-- Verify RLS enabled trên tất cả tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Nếu rowsecurity = false → Enable RLS:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### ❌ Vercel Build Failed
```
→ Check Vercel dashboard logs
→ Verify env vars in Vercel settings
→ Common issues:
   - Missing env var (auto-sync từ Git)
   - Type errors (check build locally: npm run build)
   - Supabase connection (verify URLs correct)
```

### ❌ "Table does not exist"
```
→ Verify migration chạy thành công
→ Check Supabase Table Editor - all tables should visible
→ If not → Re-run migration
```

---

## 📚 USEFUL LINKS & RESOURCES

| Resource | URL |
|----------|-----|
| **GitHub Repo** | https://github.com/baonguyen-kobe/YCCV-K-D |
| **Production App** | https://yccv-kdd.vercel.app |
| **Vercel Dashboard** | https://vercel.com/baonguyen-kobes-projects/yccv-kdd |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl |
| **Google Cloud Console** | https://console.cloud.google.com/apis/credentials |

**Documentation Files trong Repo:**
- `DEPLOYMENT.md` - Full deployment guide
- `SUPABASE_SETUP.md` - Database setup chi tiết
- `OAUTH_SETUP.md` - Google OAuth hướng dẫn
- `VERCEL_ENV_SETUP.md` - Environment variables

---

## ✅ COMPLETION CHECKLIST

Sau khi hoàn thành tất cả bước, check list này:

### Database
- [ ] Supabase: 12+ tables created ✅
- [ ] Supabase: RLS enabled 🔒 on all tables
- [ ] Supabase: Google OAuth enabled
- [ ] Supabase: Admin user created with email

### Deployment
- [ ] Vercel: Deployment status = Ready ✅
- [ ] Vercel: Build successful (no errors in logs)
- [ ] Google: OAuth redirect URIs configured
- [ ] Google: JavaScript origins configured

### Testing
- [ ] Can access landing page: https://yccv-kdd.vercel.app
- [ ] Can login with Google
- [ ] Can access admin pages
- [ ] Can create request
- [ ] No errors in browser console (F12)
- [ ] No errors in Vercel/Supabase logs

---

## 🎉 KHI XONG TẤT CẢ

**🚀 App của bạn LIVE tại:** https://yccv-kdd.vercel.app

### Next Actions:
- [ ] Share URL với team
- [ ] Add thêm users vào database nếu cần
- [ ] Monitor logs trong vài ngày đầu
- [ ] Setup Vercel analytics (optional)
- [ ] Configure custom domain (optional)

---

## 💡 NOTES

- **Never commit `.env.production.local`** - Already in .gitignore ✅
- **RLS is critical** - Ensures data security ⚠️
- **Test thoroughly** - Before going to production
- **Keep logs monitored** - For the first week

**Chúc mừng! Deployment automation hoàn tất! 🎊**

Nếu gặp vấn đề, check [NEXT_STEPS.md](NEXT_STEPS.md) troubleshooting section.


### 1️⃣ SUPABASE DATABASE SETUP (15 phút)

**Dashboard:** https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl

#### ✅ Bước 1.1: Run Migration
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Click **New query**
- [ ] Copy toàn bộ file: `supabase/migrations/0001_full_schema.sql` (~1400 lines)
- [ ] Paste vào editor
- [ ] Click **Run** (Ctrl + Enter)
- [ ] Verify: **Table Editor** → Should see 12+ tables (roles, users, units, categories, requests, etc.)

#### ✅ Bước 1.2: Enable RLS
- [ ] SQL Editor → **New query** (tab mới)
- [ ] Copy file: `supabase/enable_rls_authenticated.sql`
- [ ] Paste và **Run**
- [ ] Verify: Table Editor → Select any table → Top right có 🔒 badge

#### ✅ Bước 1.3: Setup Google OAuth
- [ ] Go to **Authentication** → **Providers**
- [ ] Find **Google** → Toggle ON
- [ ] Lấy credentials từ `.env.production.local` (file local, KHÔNG commit):
  ```
  Client ID: [Xem trong .env.production.local]
  Client Secret: [Xem trong .env.production.local]
  ```
- [ ] Go to **Authentication** → **URL Configuration**
  ```
  Site URL: https://yccv-kdd.vercel.app
  
  Redirect URLs (add these):
  http://localhost:3000/**
  https://yccv-kdd.vercel.app/**
  ```
- [ ] Click **Save**

#### ✅ Bước 1.4: Create Admin User
- [ ] SQL Editor → New query
- [ ] Copy & edit SQL này (thay YOUR_EMAIL):
  ```sql
  -- Thay your-email@gmail.com bằng email Google bạn sẽ dùng login
  INSERT INTO users (id, email, full_name, created_at)
  VALUES (
    gen_random_uuid(),
    'your-email@gmail.com',  -- ⚠️ THAY ĐỔI
    'Admin User',
    now()
  );

  -- Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  SELECT u.id, r.id
  FROM users u
  CROSS JOIN roles r
  WHERE u.email = 'your-email@gmail.com'  -- ⚠️ THAY ĐỔI
    AND r.name = 'admin';

  -- Verify
  SELECT u.email, u.full_name, r.name as role
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  JOIN roles r ON r.id = ur.role_id
  WHERE u.email = 'your-email@gmail.com';  -- ⚠️ THAY ĐỔI
  ```
- [ ] Run query
- [ ] Should return 1 row với role = 'admin'

---

### 2️⃣ VERCEL DEPLOYMENT CHECK (2 phút)

**Dashboard:** https://vercel.com/baonguyen-kobes-projects/yccv-kdd

- [ ] Check deployment status (should be "Ready" or "Building")
- [ ] If Building: Wait 2-3 minutes
- [ ] If Ready: Click deployment → View logs
- [ ] Verify no errors in logs
- [ ] Note deployment URL (should be https://yccv-kdd.vercel.app)

---

### 3️⃣ GOOGLE OAUTH VERIFICATION (5 phút)

**Google Console:** https://console.cloud.google.com/apis/credentials

- [ ] Select project: **YCCV App**
- [ ] Click vào OAuth 2.0 Client ID đang dùng
- [ ] Verify **Authorized redirect URIs** contains:
  ```
  ✅ https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback
  ✅ https://yccv-kdd.vercel.app/auth/callback
  ✅ http://localhost:3000/auth/callback
  ```
- [ ] Verify **Authorized JavaScript origins**:
  ```
  ✅ https://yccv-kdd.vercel.app
  ✅ http://localhost:3000
  ```
- [ ] Nếu thiếu → Add và Save

---

### 4️⃣ PRODUCTION TESTING (8 phút)

**URL:** https://yccv-kdd.vercel.app

#### Test 1: Landing Page
- [ ] Visit https://yccv-kdd.vercel.app
- [ ] Should see welcome page
- [ ] Should have "Sign in with Google" button

#### Test 2: Google Login
- [ ] Click "Sign in with Google"
- [ ] Select Google account (email đã add làm admin)
- [ ] Should redirect về dashboard
- [ ] No errors in console (F12 → Console tab)

#### Test 3: Admin Permissions
- [ ] Dashboard should show admin menu items
- [ ] Try visit: https://yccv-kdd.vercel.app/admin/users
- [ ] Should load admin page (not "Unauthorized")

#### Test 4: Create Request
- [ ] Click "Create Request" or visit `/requests/create`
- [ ] Fill form with test data
- [ ] Submit
- [ ] Should create successfully
- [ ] Should redirect to requests list

#### Test 5: Check Logs
- [ ] Vercel Dashboard → Logs tab → Check for errors
- [ ] Supabase Dashboard → Logs → Check for errors
- [ ] Browser Console (F12) → No red errors

---

## 🐛 TROUBLESHOOTING QUICK REFERENCE

### ❌ Vercel Build Fails
```
→ Check Vercel dashboard logs
→ Verify env vars in Vercel settings (should auto-sync from connected Git)
→ Try redeploy: Vercel → Deployments → Latest → Redeploy
```

### ❌ "Unauthorized" Error
```sql
-- Check user exists and has admin role
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@gmail.com';

-- If empty, re-run admin user creation SQL
```

### ❌ OAuth Redirect Error
```
→ Verify redirect URIs in Google Console
→ Verify redirect URIs in Supabase Auth settings
→ Clear browser cookies and try again
```

### ❌ RLS Blocking Queries
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Re-run RLS script if needed
-- File: supabase/enable_rls_authenticated.sql
```

---

## 📚 USEFUL LINKS

| Resource | URL |
|----------|-----|
| **GitHub Repo** | https://github.com/baonguyen-kobe/YCCV-K-D |
| **Production App** | https://yccv-kdd.vercel.app |
| **Vercel Dashboard** | https://vercel.com/baonguyen-kobes-projects/yccv-kdd |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl |
| **Google Cloud Console** | https://console.cloud.google.com/apis/credentials |

**Documentation Files:**
- `DEPLOYMENT.md` - Full deployment guide
- `SUPABASE_SETUP.md` - Database setup chi tiết
- `OAUTH_SETUP.md` - Google OAuth hướng dẫn
- `VERCEL_ENV_SETUP.md` - Environment variables

---

## ✅ COMPLETION CHECKLIST

Sau khi hoàn thành tất cả, check list này:

- [ ] Supabase: 12+ tables created
- [ ] Supabase: RLS enabled (🔒 icon visible)
- [ ] Supabase: Google OAuth enabled
- [ ] Supabase: Admin user created
- [ ] Vercel: Deployment successful (status = Ready)
- [ ] Google: OAuth redirect URIs configured
- [ ] Testing: Can login with Google
- [ ] Testing: Can access admin pages
- [ ] Testing: Can create request
- [ ] Testing: No errors in logs

---

## 🎉 KHI XONG TẤT CẢ

**App của bạn đã LIVE tại:** https://yccv-kdd.vercel.app

Next actions:
- Share URL với team
- Add thêm users vào database nếu cần
- Monitor logs trong vài ngày đầu
- Setup Vercel analytics (optional)
- Configure custom domain (optional)

**Chúc mừng! 🚀**
