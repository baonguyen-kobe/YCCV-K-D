# Hướng dẫn Deploy lên Vercel

**Last Updated**: 2025-12-11  
**Project**: Job Request Management System

---

## 📋 YÊU CẦU TRƯỚC KHI DEPLOY

- [x] Supabase project đã setup xong (xem `SUPABASE_MANUAL_SETUP.md`)
- [x] Code đã build thành công local: `npm run build`
- [x] File `.env.local` có đầy đủ env variables

---

## BƯỚC 1: CHUẨN BỊ CODE

### 1.1 Verify Build Local

```bash
cd d:\YCCV\yccv-app

# Clean build
rm -rf .next
npm run build

# Expected: ✓ Compiled successfully
```

### 1.2 Update `.gitignore`

Verify file `.gitignore` có các dòng sau:

```gitignore
# Env files
.env
.env*.local

# Build
.next/
out/

# Dependencies
node_modules/
```

### 1.3 Commit Code

```bash
cd d:\YCCV\yccv-app

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "feat: complete MVP with whitelist check"

# Push to GitHub
git push origin main
```

---

## BƯỚC 2: TẠO VERCEL PROJECT

### 2.1 Đăng ký/Đăng nhập Vercel

1. Truy cập: https://vercel.com
2. Nhấn **"Sign Up"** hoặc **"Log In"**
3. Chọn **"Continue with GitHub"** (đề xuất)
4. Authorize Vercel truy cập GitHub repos

### 2.2 Import Project

1. Nhấn **"Add New..."** → **"Project"**
2. Chọn repository GitHub: `YCCV` (hoặc tên repo của bạn)
3. Nhấn **"Import"**

### 2.3 Configure Project

**Framework Preset:**
- Vercel tự động detect **Next.js**

**Root Directory:**
- Nếu code ở subfolder: Chọn `yccv-app/`
- Nếu code ở root: Để trống

**Build & Output Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Node.js Version:**
- Chọn `18.x` hoặc `20.x`

✅ Nhấn **"Deploy"** (chưa nhập env variables - sẽ lỗi ngay, đừng lo)

---

## BƯỚC 3: SETUP ENVIRONMENT VARIABLES

### 3.1 Stop Deployment đầu tiên

Build đầu tiên sẽ **FAIL** vì thiếu env variables. Đó là bình thường.

### 3.2 Add Environment Variables

1. Trong Vercel Dashboard → Vào project vừa tạo
2. Chọn **Settings** → **Environment Variables**
3. Add từng variable sau:

#### Supabase Variables

**Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xxxxxxxxxxxxx.supabase.co` (từ Supabase Dashboard)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Nhấn **Save**

**Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key từ Supabase)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Nhấn **Save**

**Variable 3:**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role key từ Supabase)
- **Environments**: ✅ Production (ONLY Production - bảo mật)
- Nhấn **Save**

#### Email Variables (Optional - có thể skip)

**Variable 4 (Optional):**
- **Key**: `RESEND_API_KEY`
- **Value**: `re_...` (nếu đã setup Resend)
- **Environments**: ✅ Production
- Nhấn **Save**

**Variable 5 (Optional):**
- **Key**: `GOOGLE_DOCS_TEMPLATE_ID`
- **Value**: `1ABC...XYZ` (ID của Google Docs template)
- **Environments**: ✅ Production
- Nhấn **Save**

### 3.3 Verify Variables

Kiểm tra lại đã có:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ⚪ `RESEND_API_KEY` (optional)
- ⚪ `GOOGLE_DOCS_TEMPLATE_ID` (optional)

---

## BƯỚC 4: DEPLOY LẦN 2

### 4.1 Trigger Redeploy

1. Vào **Deployments** tab
2. Click vào deployment thất bại đầu tiên
3. Nhấn nút **"Redeploy"** (góc trên bên phải)
4. Đợi ~2-3 phút

**Expected Output:**
```
✓ Building
✓ Deploying
✓ Ready
```

### 4.2 Get Production URL

Sau khi deploy thành công:
- URL mặc định: `https://yccv-job-requests.vercel.app` (hoặc tên project của bạn)
- Copy URL này để config Supabase

---

## BƯỚC 5: CẬP NHẬT SUPABASE PRODUCTION CONFIG

### 5.1 Update Site URL

1. Vào Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update các fields:

**Site URL:**
```
https://yccv-job-requests.vercel.app
```

**Redirect URLs:** (Add new)
```
https://yccv-job-requests.vercel.app/auth/callback
http://localhost:3000/auth/callback (keep for local dev)
```

3. Nhấn **Save**

### 5.2 Update Google OAuth Redirect URIs

1. Vào Google Cloud Console: https://console.cloud.google.com
2. Chọn project **"EIU Job Requests"**
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID đã tạo
5. Thêm **Authorized redirect URIs**:

```
https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback (đã có)
```

**Không cần thêm Vercel URL** (vì OAuth redirect về Supabase, rồi Supabase redirect về Vercel)

6. Nhấn **Save**

---

## BƯỚC 6: TEST PRODUCTION

### 6.1 Test Basic Access

1. Mở browser → Truy cập production URL:
   ```
   https://yccv-job-requests.vercel.app
   ```
2. ✅ Auto redirect → `/login`

### 6.2 Test Email/Password Login

1. Nhập:
   - Email: `admin@eiu.edu.vn`
   - Password: `Admin@123`
2. Nhấn **"Đăng nhập"**
3. ✅ Redirect → `/dashboard`
4. ✅ Thấy stats widgets

### 6.3 Test Google OAuth

1. Click **"Đăng nhập với Google"**
2. Chọn Google account có email trong whitelist
3. ✅ Redirect về `/dashboard`

**Test Whitelist Block:**
1. Click **"Đăng nhập với Google"**
2. Chọn account KHÔNG có trong users table
3. ✅ Redirect về `/login?error=not_whitelisted`
4. ✅ Thấy thông báo: "Tài khoản của bạn chưa được cấp quyền truy cập"

### 6.4 Test CRUD Operations

**Create Request:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/requests/create`
3. Điền form và nhấn **"Lưu nháp"**
4. ✅ Thấy toast success
5. ✅ Redirect về `/requests`

**View Request:**
1. Click vào request vừa tạo
2. ✅ Thấy chi tiết request
3. ✅ Thấy action buttons

**Status Change:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào request DRAFT
3. Nhấn **"Gửi phiếu"**
4. ✅ Status chuyển NEW

---

## BƯỚC 7: SETUP CUSTOM DOMAIN (TÙY CHỌN)

### 7.1 Add Custom Domain

1. Trong Vercel Dashboard → **Settings** → **Domains**
2. Nhấn **"Add"**
3. Nhập domain: `requests.eiu.edu.vn` (hoặc subdomain của trường)
4. Vercel sẽ hiển thị DNS records cần add

### 7.2 Configure DNS

Tùy DNS provider (Cloudflare, GoDaddy, etc.):

**A Record:**
```
Type: A
Name: requests (hoặc @)
Value: 76.76.21.21 (Vercel IP - check từ dashboard)
TTL: Auto
```

**CNAME Record (alternative):**
```
Type: CNAME
Name: requests
Value: cname.vercel-dns.com
TTL: Auto
```

### 7.3 Verify Domain

1. Đợi DNS propagate (~5-10 phút)
2. Vercel sẽ tự động issue SSL certificate
3. ✅ Access: `https://requests.eiu.edu.vn`

### 7.4 Update Supabase URLs

Nếu dùng custom domain, update lại:
1. Supabase → Authentication → URL Configuration
2. Site URL: `https://requests.eiu.edu.vn`
3. Redirect URLs: Add `https://requests.eiu.edu.vn/auth/callback`

---

## BƯỚC 8: MONITORING & LOGS

### 8.1 View Deployment Logs

1. Vercel Dashboard → **Deployments**
2. Click vào deployment → Tab **"Logs"**
3. Theo dõi real-time logs

### 8.2 View Runtime Logs

1. Vercel Dashboard → **Logs** (menu bên trái)
2. Filter by:
   - **Errors**: Chỉ lỗi
   - **All**: Tất cả requests

### 8.3 Setup Alerts (Optional)

1. Vercel Dashboard → **Settings** → **Notifications**
2. Enable:
   - ✅ Deployment Failed
   - ✅ Deployment Succeeded
   - ⚪ Build Errors
3. Nhập email nhận thông báo

---

## 🎯 PRODUCTION CHECKLIST

Kiểm tra lại toàn bộ deployment:

- [ ] ✅ Code đã push lên GitHub
- [ ] ✅ Vercel project đã import
- [ ] ✅ Environment variables đã add (3 bắt buộc)
- [ ] ✅ Deployment thành công (Build Status: Ready)
- [ ] ✅ Supabase Site URL đã update
- [ ] ✅ Google OAuth Redirect URIs đã update
- [ ] ✅ Test login production thành công
- [ ] ✅ Test whitelist block hoạt động
- [ ] ✅ Test CRUD operations hoạt động
- [ ] ⚪ (Optional) Custom domain đã setup
- [ ] ⚪ (Optional) Monitoring alerts đã enable

---

## 🚀 CI/CD AUTO DEPLOYMENT

### Preview Deployments

Vercel tự động tạo preview deployment cho mỗi PR/branch:

**Workflow:**
```bash
# Tạo branch mới
git checkout -b feature/new-feature

# Code changes...
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature
```

**Kết quả:**
- Vercel tự động deploy preview: `https://yccv-job-requests-git-feature-new-feature.vercel.app`
- Comment trong PR với link preview
- Test trên preview trước khi merge

### Production Deployment

Mỗi khi merge vào `main`:
```bash
git checkout main
git merge feature/new-feature
git push origin main
```

**Kết quả:**
- Vercel tự động deploy production
- URL không đổi: `https://yccv-job-requests.vercel.app`

---

## 🚨 ROLLBACK (NẾU CÓ LỖI)

### Rollback về deployment trước

1. Vào **Deployments** tab
2. Tìm deployment gần nhất (working)
3. Click **"..."** menu → **"Promote to Production"**
4. ✅ Instant rollback (< 10 giây)

### Rollback via Git

```bash
# Find last working commit
git log --oneline

# Revert to commit
git revert <commit-hash>

# Push
git push origin main
```

Vercel sẽ tự động deploy commit mới.

---

## 🔧 PERFORMANCE OPTIMIZATION

### Enable Edge Functions (Advanced)

File `middleware.ts` đang chạy Edge Runtime:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

✅ Đã tối ưu - Không cần thay đổi

### Enable Image Optimization

Next.js tự động optimize images trong thư mục `public/`:

```typescript
// next.config.ts
const config: NextConfig = {
  images: {
    domains: ['xxxxxxxxxxxxx.supabase.co'], // Add Supabase storage domain
  },
};
```

Nếu hiển thị images từ Supabase Storage, add domain vào config.

---

## 📊 ANALYTICS (TÙY CHỌN)

### Vercel Analytics

1. Vercel Dashboard → **Analytics** tab
2. Nhấn **"Enable Analytics"** (Free tier: 100k events/month)
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Real-time traffic

### Vercel Speed Insights

1. Vercel Dashboard → **Speed Insights** tab
2. Nhấn **"Enable Speed Insights"**
3. View:
   - Core Web Vitals (LCP, FID, CLS)
   - Performance score
   - Slow pages

---

## 🔐 SECURITY BEST PRACTICES

### Environment Variables
- ✅ Không commit `.env.local` vào Git
- ✅ Service Role Key chỉ add vào Production environment
- ✅ Rotate keys định kỳ (6 tháng/lần)

### HTTPS
- ✅ Vercel tự động enforce HTTPS
- ✅ HTTP requests tự động redirect → HTTPS

### Headers
Vercel tự động add security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`

---

## 📞 HỖ TRỢ

### Vercel Support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

### Common Issues

**Issue: "Module not found" error**
→ Check `package.json` dependencies, run `npm install` local

**Issue: Build timeout**
→ Check build logs, tối ưu build time (remove unused deps)

**Issue: "Invalid environment variable"**
→ Verify env var names match exactly (case-sensitive)

**Issue: 500 Internal Server Error**
→ Check Runtime Logs trong Vercel Dashboard

---

## 🎉 DEPLOYMENT COMPLETE

Production app đang chạy tại:
```
https://yccv-job-requests.vercel.app
```

**Next Steps**: Đọc `TEST_MANUAL_CHECKLIST.md` để test toàn bộ features
