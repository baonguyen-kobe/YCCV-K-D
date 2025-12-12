# 🚀 DEPLOYMENT GUIDE - Quick Reference

## 📋 Overview

**Project:** YCCV Request Management System  
**Tech Stack:** Next.js 15 + TypeScript + Supabase + Google OAuth  
**Production URL:** https://yccv-kdd.vercel.app  
**Supabase:** jffinzioyizzuneqpwxl.supabase.co

---

## ✅ Current Status

- ✅ Code complete and tested
- ✅ Auth RLS issues fixed
- ✅ GitHub repo ready
- ⏳ Needs: Database setup + OAuth config

---

## 🗂️ Essential Files

### SQL Migrations (chạy theo thứ tự):
1. **`supabase/migrations/0001_full_schema.sql`** - Main database schema
2. **`supabase/0002_auto_fix_auth_rls.sql`** - Fix authentication & RLS policies
3. **`supabase/seed_complete.sql`** - Seed data (optional)

### Optional SQL:
- `supabase/0003_debug_auth_rls.sql` - Diagnostic queries
- `supabase/setup_storage.sql` - File storage setup
- `supabase/avatar_storage.sql` - Avatar uploads

---

## 🔥 Quick Deploy (30 minutes)

### Step 1: Push to GitHub (5 min)

```bash
cd "g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2"

# Initialize git
git init
git add .
git commit -m "feat: YCCV v1.2.2 with auth fixes"

# Create repo on GitHub (private): yccv-kdd
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/yccv-kdd.git
git branch -M main
git push -u origin main
```

**Verify:** Code appears on GitHub, Vercel auto-deploys

---

### Step 2: Supabase Database (10 min)

**Dashboard:** https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl

#### 2.1. Run Migrations

1. Go to **SQL Editor** → **New query**
2. Copy/paste `supabase/migrations/0001_full_schema.sql`
3. Click **Run**
4. Wait for success message

5. **New query** → Copy/paste `supabase/0002_auto_fix_auth_rls.sql`
6. Click **Run**

#### 2.2. Verify Tables

Go to **Table Editor** - should see:
- users, user_roles, roles ✓
- requests, request_items ✓
- categories, units ✓
- All tables have 🔒 (RLS enabled)

---

### Step 3: Google OAuth Setup (10 min)

#### 3.1. Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create project: **YCCV App**
3. Enable **Google+ API**
4. **APIs & Services** → **OAuth consent screen**:
   - User Type: **Internal** (if workspace) or **External**
   - App name: **YCCV Request System**
   - Support email: your-email@eiu.edu.vn
   - Developer email: same as above
   - Save
5. **Credentials** → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: **YCCV Production**
   - Authorized JavaScript origins:
     ```
     https://yccv-kdd.vercel.app
     https://jffinzioyizzuneqpwxl.supabase.co
     ```
   - Authorized redirect URIs:
     ```
     https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback
     ```
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

#### 3.2. Supabase OAuth Config

1. Go to **Authentication** → **Providers**
2. Find **Google** → Enable
3. Paste:
   - **Client ID:** (from Google Console)
   - **Client Secret:** (from Google Console)
4. Save

5. **URL Configuration**:
   - Site URL: `https://yccv-kdd.vercel.app`
   - Redirect URLs:
     ```
     https://yccv-kdd.vercel.app
     https://yccv-kdd.vercel.app/auth/callback
     http://localhost:3000
     http://localhost:3000/auth/callback
     ```

---

### Step 4: Vercel Environment Variables (5 min)

**Dashboard:** https://vercel.com/dashboard → yccv-kdd → **Settings** → **Environment Variables**

Add these 4 variables:

```
NEXT_PUBLIC_SUPABASE_URL
= https://jffinzioyizzuneqpwxl.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTA4MTcsImV4cCI6MjA4MTEyNjgxN30.WZK-5MJx8K3pyD5Rp0UF-524SrUW1Op9ZxMeYXSBnsA

SUPABASE_SERVICE_ROLE_KEY
= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZmluemlveWl6enVuZXFwd3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU1MDgxNywiZXhwIjoyMDgxMTI2ODE3fQ.wwEeu8sRbz92LAARcucEROk6BX2Q4Qf_NmgcMAP_YyI

NEXT_PUBLIC_GOOGLE_OAUTH_ID
= (Your Google Client ID from Step 3)
```

**Check all 3 environments:** Production, Preview, Development

**Redeploy:** Vercel → Deployments → Latest → ⋯ → Redeploy

---

## 🧪 Testing Production

### Test 1: Homepage
- Visit https://yccv-kdd.vercel.app
- Should see login page
- No errors in console

### Test 2: Login
- Click "Đăng nhập với Google"
- Should redirect to Google
- After auth, should return to app
- Check: User profile loads

### Test 3: Create Request
- Click "Tạo yêu cầu mới"
- Fill form, add items
- Submit
- Verify: Request appears in list

---

## 🐛 Troubleshooting

### "User not found" error
```sql
-- Run in Supabase SQL Editor:
SELECT * FROM users WHERE email = 'your-email@eiu.edu.vn';

-- If not exists, user needs to be whitelisted
INSERT INTO users (id, email, full_name, is_active)
VALUES (
  gen_random_uuid(),
  'your-email@eiu.edu.vn',
  'Your Name',
  true
);
```

### "Could not embed" relationship error
Already fixed in auth code with FK hint: `user_roles!user_roles_user_id_fkey`

### OAuth redirect mismatch
Check:
1. Google Console authorized URIs matches Supabase callback
2. Supabase redirect URLs includes Vercel domain

---

## 📚 Additional Resources

- **Full Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Feature Status:** See [FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md)
- **Auth Fix Details:** See [FIX_AUTH_RLS_SUMMARY.md](FIX_AUTH_RLS_SUMMARY.md)
- **Database Schema:** See [DATA_SCHEMA.md](DATA_SCHEMA.md)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel auto-deployed
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] Google OAuth configured
- [ ] Vercel env vars set
- [ ] Tested login
- [ ] Tested create request
- [ ] No console errors

**Status:** Ready to deploy! 🚀
