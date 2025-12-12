# 🔐 GOOGLE OAUTH SETUP - Hướng dẫn Chi tiết

Hướng dẫn từng bước để setup Google OAuth cho YCCV app.

---

## 📋 PREREQUISITES

- ✅ Google account (Gmail)
- ✅ Supabase project đã tạo
- ✅ Vercel deployment đã có (hoặc biết URL sẽ deploy)
- ✅ 15-20 phút

---

## 🎯 OVERVIEW

Google OAuth cho phép users login bằng Google account. Setup gồm 3 bước chính:

1. **Google Cloud Console** - Tạo OAuth credentials
2. **Supabase** - Config Google provider
3. **Test** - Verify login works

---

## 📍 BƯỚC 1: TẠO GOOGLE CLOUD PROJECT (5 phút)

### 1.1. Truy cập Google Cloud Console
1. Vào https://console.cloud.google.com/
2. Đăng nhập bằng Google account
3. Chấp nhận Terms of Service (nếu lần đầu)

### 1.2. Tạo Project Mới
1. Click dropdown **"Select a project"** ở top bar
2. Click **"New Project"**
3. Điền thông tin:
   ```
   Project name: YCCV App
   Organization: (để trống nếu không có)
   Location: (để mặc định)
   ```
4. Click **"Create"**
5. Đợi ~10 giây để project khởi tạo
6. Click **"Select Project"** để chọn project vừa tạo

✅ **Checkpoint:** Project name "YCCV App" hiển thị ở top bar

---

## 📍 BƯỚC 2: ENABLE GOOGLE+ API (2 phút)

### 2.1. Vào APIs Library
1. Từ Google Cloud Console
2. Click menu ☰ (hamburger) ở góc trái
3. Chọn **"APIs & Services"** → **"Library"**

### 2.2. Enable Required APIs
1. Search: `Google+ API`
2. Click vào result **"Google+ API"**
3. Click button **"Enable"**
4. Đợi ~5 giây

**Alternative APIs (tùy need):**
- `Google People API` - Để lấy thêm profile info
- `Gmail API` - Nếu cần send email

✅ **Checkpoint:** "Google+ API" status = "Enabled"

---

## 📍 BƯỚC 3: CONFIGURE OAUTH CONSENT SCREEN (5 phút)

### 3.1. Vào OAuth Consent Screen
1. Menu ☰ → **"APIs & Services"** → **"OAuth consent screen"**

### 3.2. Chọn User Type

**Option A: Internal** (Khuyến nghị nếu có Google Workspace)
- ✅ Chỉ cho phép users trong organization
- ✅ Không cần Google verification
- ✅ Unlimited users trong org
- ❌ Cần Google Workspace account

**Option B: External** (Cho Gmail thông thường)
- ✅ Cho phép bất kỳ Gmail nào
- ⚠️ Limited 100 test users (trước khi verify)
- ⚠️ Có warning "App not verified" khi login
- ✅ Có thể verify sau (nếu cần production)

**Chọn:** External → Click **"Create"**

### 3.3. App Information (Page 1)
Điền các field:

```
App name: YCCV - Hệ thống Quản lý Yêu cầu Công việc

User support email: [your-email@gmail.com]

App logo: (Optional) Upload logo 120x120px

Application home page: https://your-app.vercel.app
(Hoặc để trống nếu chưa deploy)

Application privacy policy: https://your-app.vercel.app/privacy
(Hoặc để trống)

Application terms of service: https://your-app.vercel.app/terms
(Hoặc để trống)
```

**Developer contact information:**
```
Email: [your-email@gmail.com]
```

Click **"Save and Continue"**

### 3.4. Scopes (Page 2)

**Default scopes (tự động có):**
- `openid`
- `email`
- `profile`

**Thêm scopes (Optional):**
1. Click **"Add or Remove Scopes"**
2. Tìm và check:
   - `.../auth/userinfo.email` - Email address
   - `.../auth/userinfo.profile` - Basic profile
3. Click **"Update"**

Click **"Save and Continue"**

### 3.5. Test Users (Page 3)

⚠️ **Quan trọng cho External apps:**

1. Click **"+ Add Users"**
2. Thêm emails sẽ test (max 100):
   ```
   your-email@gmail.com
   colleague1@gmail.com
   colleague2@gmail.com
   ```
3. Click **"Add"**
4. Click **"Save and Continue"**

### 3.6. Summary (Page 4)
Review thông tin → Click **"Back to Dashboard"**

✅ **Checkpoint:** OAuth consent screen status = "Testing" (External) hoặc "In production" (Internal)

---

## 📍 BƯỚC 4: TẠO OAUTH CLIENT ID (5 phút)

### 4.1. Vào Credentials
1. Menu ☰ → **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"**
3. Chọn **"OAuth client ID"**

### 4.2. Configure Client

**Application type:** Web application

**Name:** YCCV Web Client

**Authorized JavaScript origins:**
Add các URLs sau (từng dòng một):
```
http://localhost:3000
https://yccv-kdd.vercel.app
```

**Authorized redirect URIs:**
Add các URLs sau:
```
http://localhost:3000/auth/callback
https://yccv-kdd.vercel.app/auth/callback
https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback
```

**Format URIs chính xác:**
- ✅ `https://yccv-kdd.vercel.app/auth/callback`
- ✅ `https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback`
- ❌ `yccv-kdd.vercel.app/auth/callback` (thiếu https://)
- ❌ `https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback/` (thừa trailing slash)

### 4.3. Create & Copy Credentials

1. Click **"Create"**
2. Popup hiện ra với credentials
3. **QUAN TRỌNG - COPY & LƯU:**
   ```
   Client ID: xxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxx
   ```
4. Click **"Download JSON"** (backup)
5. Click **"OK"**

✅ **Checkpoint:** Có Client ID và Client Secret

---

## 📍 BƯỚC 5: CONFIG SUPABASE (3 phút)

### 5.1. Vào Supabase Authentication
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Left sidebar → **"Authentication"** → **"Providers"**

### 5.2. Enable Google Provider
1. Tìm **"Google"** trong list providers
2. Click toggle để enable
3. Điền thông tin (từ Bước 4.3):
   ```
   Client ID: [paste từ Google Cloud]
   Client Secret: [paste từ Google Cloud]
   ```
4. Click **"Save"**

### 5.3. Config Redirect URLs (Trong Supabase)
1. Vào **"Authentication"** → **"URL Configuration"**
2. Điền:
   ```
   Site URL: https://yccv-kdd.vercel.app
   
   Redirect URLs:
   http://localhost:3000/**
   https://yccv-kdd.vercel.app/**
   ```
3. Click **"Save"**

✅ **Checkpoint:** Google provider status = "Enabled" với green icon

---

## 📍 BƯỚC 6: UPDATE REDIRECT URIs (Nếu cần)

Sau khi có Vercel domain chính thức, update lại:

### 6.1. Update Google Cloud Console
1. Vào **Credentials** → Click OAuth client name
2. Edit **Authorized redirect URIs**
3. Thêm production URL:
   ```
   https://your-production-domain.vercel.app/auth/callback
   ```
4. Click **"Save"**

### 6.2. Update Supabase
1. Vào **Authentication** → **URL Configuration**
2. Add production URL vào **Redirect URLs**
3. Update **Site URL** nếu cần
4. Click **"Save"**

---

## 📍 BƯỚC 7: UPDATE CODE (1 phút)

### 7.1. Add Environment Variable
Thêm vào `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_OAUTH_ID=xxxxx.apps.googleusercontent.com
```

### 7.2. Update Vercel Environment Variables
1. Vào Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Add new variable:
   ```
   Name: NEXT_PUBLIC_GOOGLE_OAUTH_ID
   Value: [paste Client ID]
   Environment: Production, Preview, Development
   ```
4. Click **"Save"**
5. **Redeploy** để apply changes

---

## 🧪 BƯỚC 8: TEST OAUTH (5 phút)

### 8.1. Test Local
```bash
npm run dev
```
1. Navigate to http://localhost:3000
2. Click **"Đăng nhập với Google"**
3. Chọn Google account
4. Should redirect to dashboard
5. Check: User info correct

### 8.2. Test Production
1. Navigate to https://your-app.vercel.app
2. Click **"Đăng nhập với Google"**
3. Nếu External app + không verify:
   - Sẽ thấy warning "App not verified"
   - Click **"Advanced"** → **"Go to YCCV App (unsafe)"**
4. Chọn Google account
5. Should redirect to dashboard

✅ **Success indicators:**
- ✅ Redirect works (không bị redirect loop)
- ✅ User profile visible in dashboard
- ✅ User email correct
- ✅ No console errors

---

## ❌ TROUBLESHOOTING

### Issue 1: "Error 400: redirect_uri_mismatch"
**Cause:** Redirect URI không match giữa Google Cloud và app

**Fix:**
1. Check URL trong error message
2. Copy exact URL (include protocol, no trailing slash)
3. Add vào Google Cloud Console → Authorized redirect URIs
4. Wait 5 minutes for changes to propagate

**Example:**
```
Error shows: https://abcd.supabase.co/auth/v1/callback
Add exactly: https://abcd.supabase.co/auth/v1/callback
```

### Issue 2: "App not verified" warning
**Cause:** External app chưa verify bởi Google

**Fix (Option A - Testing):**
- Add test users vào OAuth consent screen
- Users phải accept warning khi login

**Fix (Option B - Production):**
- Submit app for Google verification
- Process: 1-2 weeks
- Required: Privacy policy, Terms of service
- Only needed nếu >100 users

### Issue 3: "Access blocked: This app's request is invalid"
**Cause:** Missing scopes hoặc consent screen chưa complete

**Fix:**
1. Vào OAuth consent screen
2. Complete all required fields
3. Make sure status = "Testing" hoặc "In production"
4. Verify email scope enabled

### Issue 4: Redirect loop (keeps going back to login)
**Cause:** Supabase callback không hoạt động

**Fix:**
1. Check Supabase URL Configuration
2. Verify redirect URLs include `/**` wildcard
3. Check Site URL matches production domain
4. Clear browser cookies & cache

### Issue 5: "Unauthorized client" error
**Cause:** Client ID không đúng hoặc bị disable

**Fix:**
1. Verify `NEXT_PUBLIC_GOOGLE_OAUTH_ID` matches Google Cloud
2. Check OAuth client status = "Enabled"
3. Regenerate client if needed

---

## 📋 CHECKLIST

Trước khi launch:

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added (if External)
- [ ] OAuth client ID created
- [ ] Client ID & Secret copied
- [ ] Redirect URIs added to Google Cloud:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://your-app.vercel.app/auth/callback`
  - [ ] `https://PROJECT.supabase.co/auth/v1/callback`
- [ ] Supabase Google provider enabled
- [ ] Supabase redirect URLs configured
- [ ] Environment variable added to Vercel
- [ ] Local testing passed
- [ ] Production testing passed
- [ ] Documentation updated with real URLs

---

## 🔐 SECURITY BEST PRACTICES

### DO's ✅
- ✅ Use HTTPS for all redirect URIs (except localhost)
- ✅ Add only necessary scopes
- ✅ Limit test users (for External apps)
- ✅ Rotate Client Secret periodically
- ✅ Monitor OAuth usage in Google Cloud Console
- ✅ Keep Client Secret in Supabase only (never in code)

### DON'Ts ❌
- ❌ Never commit Client Secret to Git
- ❌ Don't expose Client Secret in browser code
- ❌ Don't add wildcard redirect URIs (`http://*`)
- ❌ Don't use HTTP in production redirect URIs
- ❌ Don't share Client Secret via email/chat

---

## 📊 MONITORING & MAINTENANCE

### Check OAuth Health
1. **Google Cloud Console:**
   - Metrics → OAuth consent → Track usage
   - Check for errors/rejections

2. **Supabase Dashboard:**
   - Authentication → Users → Check login activity
   - Logs → Filter by "auth" → Monitor errors

### When to Update
- ✅ When changing domains (update redirect URIs)
- ✅ When adding scopes (update consent screen)
- ✅ When Client Secret compromised (rotate immediately)
- ✅ Annually (security audit)

---

## 🎓 ADDITIONAL RESOURCES

- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **OAuth Playground:** https://developers.google.com/oauthplayground
- **OAuth Debugger:** https://oauthdebugger.com/

---

## 📞 NEED HELP?

Common places to get stuck:
1. **Redirect URI mismatch** → Check exact URLs (protocol, slash)
2. **App not verified warning** → Add test users or submit for verification
3. **Callback 404** → Check Supabase redirect URLs config

---

**Setup Time:** ~20 minutes  
**Complexity:** ⭐⭐⭐ (Medium)  
**Last Updated:** December 2025  
**Status:** ✅ Production Ready
