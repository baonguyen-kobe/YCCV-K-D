# ✅ PRODUCTION DEPLOYMENT - Quick Checklist

**Project:** yccv-kdd  
**Vercel:** https://yccv-kdd.vercel.app  
**Supabase:** jffinzioyizzuneqpwxl  
**Status:** Ready to Deploy

---

## 🎯 DEPLOYMENT FLOW

```
1. Push Code to GitHub
   ↓
2. Vercel Auto-Redeploy
   ↓
3. Setup Supabase Database
   ↓
4. Add Vercel Env Vars
   ↓
5. Test Production
```

---

## 📋 STEP 1: PUSH TO GITHUB (5 phút)

### Commands:
```bash
cd "g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2"

# Initialize Git
git init

# Add files
git add .

# Verify .env.production.local NOT staged
git status | Select-String "production.local"
# Should return NOTHING

# Commit
git commit -m "Production ready: YCCV v1.2.2"

# Create repo on GitHub: yccv-kdd (private)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/yccv-kdd.git
git branch -M main
git push -u origin main
```

### Verify:
- [ ] Code trên GitHub
- [ ] `.env.production.local` KHÔNG có trên GitHub
- [ ] Vercel starting auto-deploy

---

## 📋 STEP 2: SUPABASE DATABASE (10 phút)

### 2.1. Run Migration
```sql
-- Vào: https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl
-- SQL Editor → New query

-- Paste toàn bộ: supabase/migrations/0001_full_schema.sql
-- Click Run
```

### 2.2. Enable RLS
```sql
-- New query
-- Paste toàn bộ: supabase/enable_rls_authenticated.sql
-- Click Run
```

### 2.3. Add Admin User
```sql
-- Thay email với email bạn
INSERT INTO users (id, email, full_name, created_at)
VALUES (
  gen_random_uuid(),
  'your-email@eiu.edu.vn',
  'Your Name',
  now()
);

-- Gán role admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'your-email@eiu.edu.vn'
  AND r.name = 'admin';

-- Verify
SELECT u.email, u.full_name, r.name as role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@eiu.edu.vn';
```

### Verify:
- [ ] 12+ tables created
- [ ] RLS enabled (🔒 icons)
- [ ] 4 roles exist
- [ ] Admin user added
- [ ] Admin user has 'admin' role

**Detailed guide:** See `SUPABASE_SETUP.md`

---

## 📋 STEP 3: VERCEL ENV VARS (3 phút)

### 3.1. Vào Vercel Settings
https://vercel.com/dashboard → yccv-kdd → Settings → Environment Variables

### 3.2. Add 4 Variables:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://jffinzioyizzuneqpwxl.supabase.co
Environment: All (Production, Preview, Development)
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTA4MTcsImV4cCI6MjA4MTEyNjgxN30.WZK-5MJx8K3pyD5Rp0UF-524SrUW1Op9ZxMeYXSBnsA
Environment: All
```

**Variable 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU1MDgxNywiZXhwIjoyMDgxMTI2ODE3fQ.wwEeu8sRbz92LAARcucEROk6BX2Q4Qf_NmgcMAP_YyI
Environment: All
```

**Variable 4:**
```
Name: NEXT_PUBLIC_GOOGLE_OAUTH_ID
Value: 197285188348-5rel4b9vfbpjcu4p31mmmn6knkt1ak5f.apps.googleusercontent.com
Environment: All
```

### 3.3. Redeploy
Deployments → Latest → ⋮ → Redeploy

### Verify:
- [ ] All 4 variables added
- [ ] Redeploy triggered
- [ ] Build successful

**Detailed guide:** See `VERCEL_ENV_SETUP.md`

---

## 📋 STEP 4: VERIFY OAUTH (2 phút)

### Check Google Cloud Console
https://console.cloud.google.com/apis/credentials

**Verify Redirect URIs include:**
- ✅ `http://localhost:3000/auth/callback`
- ✅ `https://yccv-kdd.vercel.app/auth/callback`
- ✅ `https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback`

### Check Supabase Auth
https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl/auth/providers

**Verify:**
- [ ] Google provider enabled
- [ ] Client ID matches
- [ ] Client Secret filled
- [ ] Redirect URLs configured

**Detailed guide:** See `OAUTH_SETUP.md`

---

## 📋 STEP 5: TEST PRODUCTION (5 phút)

### Test 1: Homepage
1. Vào https://yccv-kdd.vercel.app
2. Should load (không blank)
3. Should redirect to `/login` hoặc `/dashboard`

### Test 2: Google OAuth
1. Click "Đăng nhập với Google"
2. Select account (phải là email đã whitelist)
3. Should redirect to dashboard
4. Check user info correct

### Test 3: Permissions
1. Admin user should see "Tạo yêu cầu" button
2. Try create request
3. Should work without errors
4. Check request appears in list

### Test 4: Logs
**Vercel:**
```
Deployments → Click latest → Runtime Logs
Should NOT see: "Missing environment variable"
Should NOT see: "Supabase client error"
```

**Supabase:**
```
Dashboard → Logs → Auth logs
Should see: Successful logins
Should NOT see: RLS policy violations
```

---

## ✅ FINAL CHECKLIST

### GitHub
- [ ] Code pushed successfully
- [ ] `.env.production.local` NOT in repo
- [ ] No sensitive data committed

### Supabase
- [ ] Migration completed
- [ ] RLS enabled
- [ ] Admin user exists
- [ ] Google OAuth configured

### Vercel
- [ ] All env vars added
- [ ] Build successful
- [ ] Deployment live

### Testing
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard accessible
- [ ] Can create request
- [ ] No console errors
- [ ] No log errors

---

## 🎉 SUCCESS!

Nếu tất cả checkboxes đều ✅, deployment thành công!

**Production URL:** https://yccv-kdd.vercel.app

**Next steps:**
1. Add more users vào whitelist
2. Train team sử dụng hệ thống
3. Monitor logs regularly
4. Setup backups

---

## 📚 DETAILED GUIDES

Nếu stuck ở bước nào:

- **Supabase:** → `SUPABASE_SETUP.md`
- **Vercel Env Vars:** → `VERCEL_ENV_SETUP.md`
- **Google OAuth:** → `OAUTH_SETUP.md`
- **General Deployment:** → `DEPLOYMENT.md`
- **Master Prompt (new chat):** → `MASTER_PROMPT.md`

---

## 🐛 QUICK TROUBLESHOOTING

**Build fails:**
```bash
# Run locally first
npm run build

# Check errors
# Fix TypeScript/ESLint errors
# Push again
```

**OAuth redirect mismatch:**
```
Check Google Cloud Console
Add exact URL from error message
Wait 5 minutes
Try again
```

**Supabase connection error:**
```
Check env vars in Vercel
Verify URLs exact (no trailing slash)
Verify keys complete
Redeploy
```

**RLS blocking queries:**
```
Check user in users table
Verify user_roles assigned
Check RLS policies enabled
Test with admin user first
```

---

**Status:** ✅ Production Deployment Guide  
**Last Updated:** December 12, 2025  
**Estimated Time:** 25-30 minutes total
