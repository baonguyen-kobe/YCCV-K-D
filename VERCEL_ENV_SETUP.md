# ⚡ VERCEL ENVIRONMENT VARIABLES SETUP

## 🎯 QUICK GUIDE

Vercel project: **yccv-kdd**
URL: https://yccv-kdd.vercel.app

---

## 📋 BƯỚC 1: VÀO VERCEL SETTINGS

1. Vào https://vercel.com/dashboard
2. Select project: **yccv-kdd**
3. Click **Settings** tab
4. Left sidebar → **Environment Variables**

---

## 📋 BƯỚC 2: ADD VARIABLES

Click **Add New** và thêm từng variable sau:

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://jffinzioyizzuneqpwxl.supabase.co
Environment: Production, Preview, Development (check all 3)
```
Click **Save**

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTA4MTcsImV4cCI6MjA4MTEyNjgxN30.WZK-5MJx8K3pyD5Rp0UF-524SrUW1Op9ZxMeYXSBnsA
Environment: Production, Preview, Development
```
Click **Save**

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU1MDgxNywiZXhwIjoyMDgxMTI2ODE3fQ.wwEeu8sRbz92LAARcucEROk6BX2Q4Qf_NmgcMAP_YyI
Environment: Production, Preview, Development
```
⚠️ **QUAN TRỌNG:** Service role key KHÔNG được expose ra browser
Click **Save**

### Variable 4: NEXT_PUBLIC_GOOGLE_OAUTH_ID
```
Name: NEXT_PUBLIC_GOOGLE_OAUTH_ID
Value: 197285188348-5rel4b9vfbpjcu4p31mmmn6knkt1ak5f.apps.googleusercontent.com
Environment: Production, Preview, Development
```
Click **Save**

---

## 📋 BƯỚC 3: VERIFY VARIABLES

After adding all 4 variables:
- [ ] NEXT_PUBLIC_SUPABASE_URL ✅
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- [ ] SUPABASE_SERVICE_ROLE_KEY ✅
- [ ] NEXT_PUBLIC_GOOGLE_OAUTH_ID ✅

Screenshot hoặc note lại để verify.

---

## 📋 BƯỚC 4: REDEPLOY

⚠️ **Environment variables chỉ apply sau khi redeploy**

### Option A: Trigger Redeploy (Nhanh)
1. Vào **Deployments** tab
2. Find latest deployment
3. Click ⋮ (3 dots menu)
4. Click **Redeploy**
5. Confirm
6. Đợi ~2-3 phút

### Option B: Push New Commit (Recommended)
```bash
cd "g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2"

# Make a small change (update README date, etc.)
git add .
git commit -m "Update: production env vars configured"
git push origin main

# Vercel tự động redeploy
```

---

## 📋 BƯỚC 5: VERIFY DEPLOYMENT

### Check Build Logs
1. Vào **Deployments** tab
2. Click vào deployment đang chạy
3. Click **Building** → View logs
4. Verify: No errors, build successful

### Check Runtime Logs
1. Click **Runtime Logs** tab
2. Should see:
   ```
   [SUPABASE] Client created successfully
   [AUTH] User authenticated
   ```
3. Should NOT see:
   ```
   [ERROR] Missing environment variable
   [ERROR] Supabase client error
   ```

---

## 📋 BƯỚC 6: TEST PRODUCTION

### Test 1: Homepage
1. Vào https://yccv-kdd.vercel.app
2. Should redirect to `/dashboard` hoặc `/login`
3. NO blank page
4. NO "Environment variable missing" error

### Test 2: Login
1. Click "Đăng nhập với Google"
2. Google OAuth popup appears
3. Select account
4. Redirect back to app
5. Should see dashboard (nếu user đã whitelist)

### Test 3: Database Connection
1. After login successful
2. Check dashboard shows stats
3. Try create request
4. Should work without errors

---

## ✅ VERIFICATION CHECKLIST

- [ ] All 4 env vars added to Vercel
- [ ] All vars have Production + Preview + Development checked
- [ ] Redeployed (either manual or via push)
- [ ] Build successful (no errors in logs)
- [ ] Homepage loads (not blank)
- [ ] Google OAuth button works
- [ ] Login successful (for whitelisted users)
- [ ] Database queries work
- [ ] No errors in Vercel logs
- [ ] No errors in browser console

---

## 🐛 TROUBLESHOOTING

### Issue: Build fails after adding env vars
**Fix:**
1. Check variable names exact (case-sensitive)
2. Check no extra spaces in values
3. Check all values are complete (không bị truncate)

### Issue: "Missing environment variable" error
**Fix:**
1. Verify variable exists: Settings → Environment Variables
2. Check variable name matches code (NEXT_PUBLIC_* prefix)
3. Redeploy để apply changes

### Issue: Supabase connection error
**Fix:**
1. Check URL format: `https://xxx.supabase.co` (no trailing slash)
2. Check keys complete (không bị cut off)
3. Verify project không bị paused (free tier)

### Issue: OAuth redirect error
**Fix:**
1. Verify NEXT_PUBLIC_GOOGLE_OAUTH_ID correct
2. Check Google Cloud Console redirect URIs include production URL
3. Wait 5 minutes for Google changes to propagate

---

## 📊 EXPECTED ENV VARS

After setup complete, Vercel should have:

| Variable | Value Preview | Environments |
|----------|---------------|--------------|
| NEXT_PUBLIC_SUPABASE_URL | https://jffinz... | Prod + Preview + Dev |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGc... | Prod + Preview + Dev |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGc... | Prod + Preview + Dev |
| NEXT_PUBLIC_GOOGLE_OAUTH_ID | 197285188... | Prod + Preview + Dev |

---

## 🔄 UPDATING VARIABLES

Nếu cần update sau này:

1. Vào Settings → Environment Variables
2. Click variable cần update
3. Click **Edit**
4. Update value
5. Click **Save**
6. **Redeploy** để apply

---

**Project:** yccv-kdd  
**Last Updated:** December 12, 2025  
**Status:** ✅ Ready to Deploy
