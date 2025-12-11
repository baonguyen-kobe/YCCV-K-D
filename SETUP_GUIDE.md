# 🚀 Hướng Dẫn Cài Đặt YCCV - Google OAuth Only

**Last Updated**: 2025-12-11  
**Authentication**: Google OAuth + Email Whitelist  
**Estimated Time**: 45 phút

---

## 📋 OVERVIEW

Hệ thống YCCV sử dụng:
- ✅ **Google OAuth** cho authentication (KHÔNG email/password)
- ✅ **Email Whitelist** trong database để kiểm soát quyền truy cập
- ✅ **Auto-create profile** từ Google metadata khi login lần đầu
- ✅ **Role-based permissions** (Admin, Manager, Staff, User)

---

## 🎯 CHECKLIST NHANH

- [ ] **Bước 1**: Setup Supabase Project (10 phút)
- [ ] **Bước 2**: Run Database Migrations (5 phút)
- [ ] **Bước 3**: Configure Google OAuth (15 phút)
- [ ] **Bước 4**: Deploy & Test Local (10 phút)
- [ ] **Bước 5**: Deploy Production (Optional - 15 phút)

---

## BƯỚC 1: SETUP SUPABASE PROJECT

### 1.1 Tạo Project Mới

1. Vào https://supabase.com → **New Project**
2. Điền thông tin:
   - **Name**: `yccv-production` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại)
   - **Region**: `Southeast Asia (Singapore)`
   - **Pricing Plan**: Free (hoặc Pro nếu cần)
3. Click **Create new project**
4. Đợi ~2 phút để project khởi tạo

### 1.2 Lấy API Credentials

1. Vào **Settings** → **API**
2. Copy các giá trị sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (API Key section)
   - **service_role key**: `eyJhbG...` (Click "Reveal" để xem)

### 1.3 Tạo File `.env.local`

```bash
cd d:\YCCV\yccv-app

# Copy file mẫu
copy .env.example .env.local

# Hoặc tạo mới với nội dung:
```

File `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ LƯU Ý**: File `.env.local` đã có trong `.gitignore`, không commit lên Git!

---

## BƯỚC 2: RUN DATABASE MIGRATIONS

### 2.1 Chạy Migration Schema

1. Vào **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung từ [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)

**✅ Expected**: "Success. No rows returned"

**Verify**: 
- Vào **Database** → **Tables** 
- Thấy 10 tables: `units`, `roles`, `users`, `user_roles`, `categories`, `requests`, `request_items`, `request_comments`, `attachments`, `request_logs`

### 2.2 Enable RLS Policies

1. Vào **SQL Editor** → **New Query**
2. Copy toàn bộ nội dung từ [supabase/enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql)
3. Paste vào SQL Editor
4. Click **Run**

**✅ Expected**: "Success. No rows returned"

**What it does**: 
- Enable RLS trên tất cả tables
- Tạo policies cho phép authenticated users truy cập dữ liệu

### 2.3 Seed Whitelist & Test Data

1. Vào **SQL Editor** → **New Query**
2. Copy toàn bộ nội dung từ [supabase/seed_complete.sql](supabase/seed_complete.sql)
3. Paste vào SQL Editor
4. Click **Run**

**✅ Expected**: Thấy summary ở cuối:
```
Auth Users: 0 (No auth users - Google OAuth will create them)
Public Users: 9
User Roles: 10
Requests: 11
Request Items: 16
Comments: 2
```

**What it does**:
- Tạo whitelist users (emails allowed to login)
- Tạo roles (admin, manager, staff, user)
- Tạo sample categories & requests (để test)

### 2.4 Tạo Storage Bucket

1. Vào **Storage** → **Create a new bucket**
2. **Name**: `request-attachments`
3. **Public bucket**: **OFF** (private)
4. Click **Create bucket**

5. Click vào bucket `request-attachments` → **Policies** → **New Policy**
6. Thêm 3 policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-attachments');
```

**Policy 2: Allow authenticated users to read**
```sql
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'request-attachments');
```

**Policy 3: Allow users to delete their own files**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'request-attachments' AND auth.uid() = owner);
```

**✅ DONE**: Database ready!

---

## BƯỚC 3: CONFIGURE GOOGLE OAUTH

### 3.1 Setup Google Cloud Console

1. Vào https://console.cloud.google.com
2. Tạo project mới:
   - Click dropdown project ở header → **New Project**
   - **Project name**: `EIU Job Requests`
   - Click **Create**

3. Vào **APIs & Services** → **OAuth consent screen**
   - User Type: **Internal** (nếu có Google Workspace) hoặc **External**
   - Click **Create**
   
4. Điền OAuth consent screen:
   - **App name**: `EIU Job Request System`
   - **User support email**: your-email@eiu.edu.vn
   - **Developer contact**: your-email@eiu.edu.vn
   - Click **Save and Continue**
   - Scopes: Skip (giữ mặc định)
   - Test users: Skip (nếu External)
   - Click **Save and Continue**

5. Vào **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
   - **Application type**: Web application
   - **Name**: `Supabase Auth`
   
6. **Authorized JavaScript origins**:
   ```
   https://your-project-id.supabase.co
   http://localhost:3000
   ```
   
7. **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   
8. Click **Create**
9. **Copy**:
   - Client ID: `1234567890-abc...apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

### 3.2 Enable Google Provider trong Supabase

1. Vào **Supabase Dashboard** → **Authentication** → **Providers**
2. Tìm **Google** → Click để expand
3. **Enable Google provider**: ON
4. Paste:
   - **Client ID**: (từ Google Cloud Console)
   - **Client Secret**: (từ Google Cloud Console)
5. Click **Save**

### 3.3 Configure Supabase URL Settings

1. Vào **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3000` (local testing)
3. **Redirect URLs** (Add both):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```
4. Click **Save**

**✅ DONE**: Google OAuth configured!

---

## BƯỚC 4: TEST LOCAL

### 4.1 Install Dependencies & Run

```bash
cd d:\YCCV\yccv-app

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Expected output**:
```
▲ Next.js 16.0.8
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

### 4.2 Test Google OAuth Login

1. Mở browser: http://localhost:3000
2. **Expected**: Auto redirect → `/login`
3. Thấy button **"Đăng nhập với Google"**
4. Click button → Google consent screen hiện
5. Chọn email **có trong whitelist** (e.g., `admin@eiu.edu.vn`)
6. **Expected**: Redirect → `/dashboard`

### 4.3 Test Whitelist Blocking

1. Logout (click avatar → Logout)
2. Click **"Đăng nhập với Google"**
3. Chọn email **KHÔNG có trong whitelist**
4. **Expected**: 
   - Redirect về `/login?error=not_whitelisted`
   - Thấy message lỗi: "Người dùng không được phép truy cập hệ thống"

### 4.4 Test Basic Features

**As Admin** (`admin@eiu.edu.vn`):
- ✅ Vào `/dashboard` → Thấy overview
- ✅ Vào `/requests` → Thấy tất cả phiếu
- ✅ Vào `/admin/users` → Thấy user management
- ✅ Vào `/admin/categories` → Thấy category tree

**As Lecturer** (`lecturer01@eiu.edu.vn`):
- ✅ Vào `/requests/create` → Tạo phiếu mới
- ✅ Điền form và submit → Phiếu tạo thành công
- ✅ Vào `/requests` → Chỉ thấy phiếu mình tạo

**✅ DONE**: Local testing complete!

---

## BƯỚC 5: DEPLOY PRODUCTION (OPTIONAL)

### 5.1 Push Code lên GitHub

```bash
cd d:\YCCV\yccv-app

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "feat: Google OAuth with whitelist - production ready"

# Push
git push origin main
```

### 5.2 Deploy lên Vercel

1. Vào https://vercel.com → **New Project**
2. Import từ GitHub → Chọn repo `YCCV`
3. **Root Directory**: `yccv-app` (nếu code ở subfolder)
4. **Framework Preset**: Next.js
5. Click **Deploy** (sẽ fail - chưa có env vars)

### 5.3 Add Environment Variables

Vercel Dashboard → **Settings** → **Environment Variables**

Add 3 variables (tất cả environments: Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

Click **Save**

### 5.4 Redeploy

1. **Deployments** tab → Tìm failed deployment
2. Click menu (3 dots) → **Redeploy**
3. Đợi 2-3 phút
4. **Expected**: Status → ✅ Ready

### 5.5 Update OAuth URLs

1. Copy production URL: `https://yccv-xxx.vercel.app`

2. **Google Cloud Console** → **Credentials** → Edit OAuth client:
   - **Authorized JavaScript origins**: Add `https://yccv-xxx.vercel.app`
   - **Authorized redirect URIs**: Add `https://yccv-xxx.vercel.app/auth/callback`

3. **Supabase** → **Authentication** → **URL Configuration**:
   - **Site URL**: Change to `https://yccv-xxx.vercel.app`
   - **Redirect URLs**: Add `https://yccv-xxx.vercel.app/auth/callback`

### 5.6 Test Production

1. Mở production URL: `https://yccv-xxx.vercel.app`
2. Click "Đăng nhập với Google"
3. Login với whitelisted email
4. **Expected**: Redirect → `/dashboard`

**✅ DONE**: Production deployed!

---

## 🎉 SUCCESS!

Hệ thống đã sẵn sàng! Giờ bạn có thể:

### Quản lý Whitelist

**Thêm user mới**:
```sql
-- Vào Supabase SQL Editor
INSERT INTO users (email, is_active, unit_id, full_name, phone)
VALUES (
  'newuser@eiu.edu.vn',
  true,
  '00000000-0000-0000-0000-000000000001', -- ID của unit
  'Họ Tên User Mới',
  '+84-123-456-789'
);

-- Assign role
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM users u, roles r
WHERE u.email = 'newuser@eiu.edu.vn'
AND r.name = 'user'; -- hoặc 'admin', 'manager', 'staff'
```

**Vô hiệu hóa user**:
```sql
UPDATE users
SET is_active = false
WHERE email = 'user@eiu.edu.vn';
```

**Xem danh sách whitelist**:
```sql
SELECT 
  u.email, 
  u.full_name, 
  u.is_active,
  array_agg(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.full_name, u.is_active
ORDER BY u.created_at DESC;
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **[WHITELIST_SETUP.md](WHITELIST_SETUP.md)** - Chi tiết về whitelist
- **[OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md)** - Google OAuth đầy đủ
- **[RLS_FIX_QUICK.md](RLS_FIX_QUICK.md)** - Fix lỗi RLS
- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** - Tóm tắt thay đổi

---

## 🆘 TROUBLESHOOTING

### "Permission denied for table requests"
→ Chạy lại [enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql)

### "Người dùng không được phép truy cập"
→ Kiểm tra email có trong `users` table với `is_active = true`

### Google OAuth "redirect_uri_mismatch"
→ Kiểm tra Authorized redirect URIs trong Google Cloud Console

### Profile không tự động tạo sau login
→ Kiểm tra [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) có upsert logic

### "User exists in auth but not in users table"
→ Bình thường - auth.users (Supabase) khác public.users (whitelist)
→ Callback sẽ tự động sync

---

## 🎯 NEXT STEPS

1. ✅ Test tất cả features theo [WHITELIST_SETUP.md](WHITELIST_SETUP.md)
2. ✅ Thêm institutional emails vào whitelist
3. ✅ Configure email notifications (optional)
4. ✅ Setup custom domain (optional)
5. ✅ Monitor Supabase usage & logs

**Chúc thành công! 🚀**
