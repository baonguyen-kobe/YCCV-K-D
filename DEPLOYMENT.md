# 🚀 DEPLOYMENT GUIDE - YCCV App

Hướng dẫn chi tiết để deploy ứng dụng YCCV lên production.

---

## 📋 PREREQUISITES (Chuẩn bị trước)

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ GitHub account
- ✅ Vercel account (free tier OK)
- ✅ Supabase account (free tier OK)
- ✅ Google Cloud account (for OAuth)

---

## 🔧 BƯỚC 1: GITHUB SETUP (5 phút)

### 1.1. Khởi tạo Git repo
```bash
cd "g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2"

# Initialize Git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: YCCV request management system"
```

### 1.2. Tạo GitHub repository
1. Vào https://github.com/new
2. Repository name: `yccv-app` (hoặc tên bạn muốn)
3. Visibility: **Private** (khuyến nghị)
4. **KHÔNG** check "Initialize with README" (vì đã có rồi)
5. Click **Create repository**

### 1.3. Push code lên GitHub
```bash
# Add remote (thay YOUR_USERNAME bằng GitHub username của bạn)
git remote add origin https://github.com/YOUR_USERNAME/yccv-app.git

# Push to main branch
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Verify code xuất hiện trên GitHub

---

## 🗄️ BƯỚC 2: SUPABASE PRODUCTION SETUP (10 phút)

### 2.1. Tạo Supabase Project
1. Vào https://supabase.com/dashboard
2. Click **New Project**
3. Điền thông tin:
   - **Name:** `yccv-prod`
   - **Database Password:** Tạo mật khẩu mạnh (lưu lại!)
   - **Region:** Singapore (gần VN nhất)
   - **Pricing Plan:** Free tier OK
4. Click **Create new project**
5. Đợi ~2 phút để project khởi tạo

### 2.2. Copy API Credentials
1. Vào **Settings** → **API**
2. Copy và lưu lại:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (key dài)
   - **service_role key:** `eyJhbGc...` (key dài khác)

### 2.3. Chạy Database Migration
1. Vào **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy toàn bộ nội dung file:
   ```
   supabase/migrations/0001_full_schema.sql
   ```
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl + Enter)
6. Verify: Không có lỗi, thấy message "Success"

### 2.4. Enable RLS (Row Level Security)
1. Vẫn trong SQL Editor
2. Copy nội dung file:
   ```
   supabase/enable_rls_authenticated.sql
   ```
3. Paste và click **Run**
4. Verify: Tables tab → mỗi table phải có ổ khóa icon (RLS enabled)

### 2.5. Configure Auth
1. Vào **Authentication** → **Providers**
2. Enable **Google OAuth** (sẽ config sau)
3. Vào **URL Configuration**:
   - **Site URL:** `http://localhost:3000` (tạm thời)
   - **Redirect URLs:** 
     ```
     http://localhost:3000/auth/callback
     https://YOUR_VERCEL_DOMAIN/auth/callback
     ```

✅ **Checkpoint:** 
- Database có 12+ tables
- RLS enabled cho tất cả tables
- Auth providers configured

---

## 🌐 BƯỚC 3: GOOGLE OAUTH SETUP (10 phút)

### 3.1. Tạo Google Cloud Project
1. Vào https://console.cloud.google.com/
2. Tạo project mới: **"YCCV App"**
3. Select project vừa tạo

### 3.2. Enable Google+ API
1. Vào **APIs & Services** → **Library**
2. Search "Google+ API"
3. Click **Enable**

### 3.3. Create OAuth Credentials
1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen (nếu chưa):
   - User Type: **Internal** (nếu có Google Workspace) hoặc **External**
   - App name: `YCCV Request Management`
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue → Skip scopes → Save
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `YCCV Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://YOUR_VERCEL_DOMAIN
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://YOUR_VERCEL_DOMAIN/auth/callback
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
5. Click **Create**
6. **Copy Client ID** (sẽ dùng sau)

### 3.4. Add Client ID to Supabase
1. Quay lại Supabase Dashboard
2. Vào **Authentication** → **Providers** → **Google**
3. Enable Google provider
4. Paste **Client ID** và **Client Secret** (từ Google Cloud)
5. Save

✅ **Checkpoint:** Google OAuth sẵn sàng

---

## ▲ BƯỚC 4: VERCEL DEPLOYMENT (5 phút)

### 4.1. Import GitHub Repo
1. Vào https://vercel.com/new
2. Import repository `yccv-app`
3. Configure project:
   - **Framework Preset:** Next.js (auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)

### 4.2. Add Environment Variables
Click **Environment Variables**, thêm các biến sau:

```env
# Supabase (từ Bước 2.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Google OAuth (từ Bước 3.3)
NEXT_PUBLIC_GOOGLE_OAUTH_ID=your-client-id.apps.googleusercontent.com
```

### 4.3. Deploy
1. Click **Deploy**
2. Đợi ~2-3 phút
3. Vercel sẽ build và deploy

✅ **Checkpoint:** Deploy thành công, có domain `your-app.vercel.app`

### 4.4. Update Redirect URLs
Sau khi có domain Vercel, update lại:

**Supabase:**
1. Vào **Authentication** → **URL Configuration**
2. Update **Site URL:** `https://your-app.vercel.app`
3. Add redirect URL: `https://your-app.vercel.app/auth/callback`

**Google Cloud:**
1. Vào OAuth credentials
2. Add authorized origins: `https://your-app.vercel.app`
3. Add redirect URI: `https://your-app.vercel.app/auth/callback`

---

## 👥 BƯỚC 5: USER WHITELIST SETUP (5 phút)

### 5.1. Thêm user đầu tiên (Admin)
1. Vào Supabase Dashboard → **Table Editor**
2. Chọn table `users`
3. Click **Insert row**:
   ```
   id: [UUID tự sinh]
   email: your-email@eiu.edu.vn
   full_name: Your Name
   unit_id: [chọn từ dropdown hoặc NULL]
   created_at: now()
   ```
4. Click **Save**

### 5.2. Gán role Admin
1. Chọn table `user_roles`
2. Click **Insert row**:
   ```
   user_id: [UUID của user vừa tạo]
   role_id: [UUID của role 'admin' từ table roles]
   ```
3. Save

### 5.3. Test Login
1. Vào `https://your-app.vercel.app`
2. Click **Đăng nhập với Google**
3. Chọn email đã whitelist
4. Verify: Redirect vào dashboard, không bị lỗi "not whitelisted"

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] App loads at production URL
- [ ] Google OAuth login works
- [ ] Whitelist user can login
- [ ] Non-whitelist user gets error message
- [ ] Dashboard shows data correctly
- [ ] Create request works
- [ ] RLS policies working (user only sees own requests)
- [ ] Admin can see all requests
- [ ] No console errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Not whitelisted" error
**Fix:** Add user email to `users` table via Supabase dashboard

### Issue: Google OAuth redirect fails
**Fix:** 
1. Check redirect URIs in Google Cloud match exactly
2. Check redirect URIs in Supabase Auth settings
3. URLs must include protocol (https://)

### Issue: Build fails on Vercel
**Fix:**
1. Check environment variables are set correctly
2. Run `npm run build` locally to see errors
3. Check Node version (must be 18+)

### Issue: "Supabase client error"
**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` format
2. Verify keys are not truncated
3. Check Supabase project is not paused (free tier limits)

---

## 📞 SUPPORT

- GitHub Issues: `https://github.com/YOUR_USERNAME/yccv-app/issues`
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Deployment Date:** {{ DATE }}
**Version:** 1.2.2
**Status:** ✅ Production Ready
