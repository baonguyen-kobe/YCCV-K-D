# ✅ DEPLOYMENT CHECKLIST

**Last Updated:** Dec 13, 2025  
**Status:** Ready to Deploy

---

## 📦 Pre-Deployment Complete

- ✅ Code organized and cleaned
- ✅ SQL files consolidated (6 files kept)
- ✅ MD docs simplified (6 files kept)
- ✅ Auth RLS fixes applied
- ✅ FK ambiguity resolved
- ✅ All TypeScript errors fixed

---

## 🚀 Deployment Steps

### □ Step 1: Push to GitHub

```bash
cd "g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2"
git init
git add .
git commit -m "feat: YCCV v1.2.2 production ready"
git remote add origin https://github.com/YOUR_USERNAME/yccv-app.git
git push -u origin main
```

### □ Step 2: Supabase Database

Run in SQL Editor:
1. `migrations/0001_full_schema.sql`
2. `0002_auto_fix_auth_rls.sql`

Verify: 12+ tables with RLS enabled

### □ Step 3: Google OAuth

1. Google Console: Create OAuth credentials
2. Supabase: Enable Google provider
3. Add redirect URIs

### □ Step 4: Vercel Env Vars

Add 4 variables (see DEPLOYMENT_QUICK.md)

### □ Step 5: Test Production

- Login works
- Create request works
- No errors

---

**Full Guide:** [DEPLOYMENT_QUICK.md](DEPLOYMENT_QUICK.md)
