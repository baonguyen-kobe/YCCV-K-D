# 🤖 MASTER PROMPT - GitHub Push & Deploy Automation

Copy prompt này vào **chat mới** để tôi thực hiện deployment tự động.

---

## 📋 PROMPT TO COPY

```
Tôi có một Next.js app (YCCV Request Management System) trong workspace này. 

CONTEXT:
- Framework: Next.js 16 + TypeScript + Supabase + Google OAuth
- Location: g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2
- Status: Code hoàn thiện, demo mode tested, build successful, production credentials ready
- Files ready: .gitignore, .env.example, .env.production.local, DEPLOYMENT.md, OAUTH_SETUP.md, SUPABASE_SETUP.md

PRODUCTION INFO (ĐÃ CÓ SẴN):
- Vercel: yccv-kdd.vercel.app (deployed, auto-redeploy enabled)
- Supabase: jffinzioyizzuneqpwxl.supabase.co (fresh project, empty database)
- Google OAuth: Configured với Client ID sẵn
- Environment variables: Đã có trong .env.production.local (gitignored)

YÊU CẦU THỰC HIỆN:

1. GITHUB SETUP & PUSH:
   - Initialize Git repo tại workspace
   - Add tất cả files (verify .env.production.local KHÔNG được commit)
   - Create initial commit với message: "Production ready: YCCV v1.2.2"
   - Hướng dẫn tôi tạo GitHub repo (tên repo: yccv-kdd)
   - Hướng dẫn add remote và push to main branch
   - Note: Vercel sẽ TỰ ĐỘNG redeploy sau khi push (không cần manual deploy)

2. VERIFY FILES:
   - Kiểm tra các files quan trọng có đầy đủ không:
     * .gitignore
     * .env.example
     * README.md
     * DEPLOYMENT.md
     * DEPLOYMENT_CHECKLIST.md
     * package.json
     * next.config.ts
     * All source files in src/
     * Migration files in supabase/migrations/

3. PRE-PUSH VERIFICATION:
   - Verify .env.production.local KHÔNG trong Git (phải ignored)
   - Verify không có node_modules trong repo
   - Verify không có sensitive data committed
   - Check package.json có đầy đủ dependencies
   - Run: npm run build (verify successful)

4. SUPABASE DATABASE SETUP:
   - Đọc SUPABASE_SETUP.md
   - Hướng dẫn chi tiết run migration script
   - Guide setup admin user đầu tiên
   - Verify RLS enabled
7. PRODUCTION TESTING:
   - Guide test production deployment
   - Test Google OAuth login
   - Test create request
   - Verify permissions (admin vs regular user)
   - Check for errors in logs

8. TROUBLESHOOTING:
   - List các lỗi thường gặp:
     * Vercel build fails
     * OAuth redirect mismatch
     * Supabase connection errors
     * RLS blocking queries
   - Cung cấp solutions nhanh với commands

OUTPUT FORMAT:
- Sử dụng checkboxes [ ] cho các bước cần làm
- Sử dụng code blocks ```bash cho commands
- Highlight WARNING và IMPORTANT bằng emoji
- Cung cấp links trực tiếp với project IDs thực tế
- Show exact commands với URLs thực (không dùng placeholders)

PRODUCTION URLs ĐỂ REFERENCE:
- Vercel: https://yccv-kdd.vercel.app
- Supabase: https://jffinzioyizzuneqpwxl.supabase.co
- Supabase Dashboard: https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl

HÃY BẮT ĐẦU TỪ BƯỚC 1: GIT INITIALIZATION & VERIFIC
6. GOOGLE OAUTH VERIFICATION:
   - Verify redirect URIs trong Google Cloud Console
   - Should include: https://yccv-kdd.vercel.app/auth/callback
   - Should include: https://jffinzioyizzuneqpwxl.supabase.co/auth/v1/callback
   - Verify Client ID matches in Vercel env vars

5. TROUBLESHOOTING:
   - List các lỗi thường gặp khi deploy
   - Cung cấp solutions nhanh

OUTPUT FORMAT:
- Sử dụng checkboxes [ ] cho các bước cần làm
- Sử dụng code blocks ```bash cho commands
- Highlight WARNING và IMPORTANT bằng emoji
- Cung cấp links trực tiếp (Supabase dashboard, Vercel, Google Cloud)

HÃY BẮT ĐẦU TỪ BƯỚC 1: GIT INITIALIZATION
```

---

## 📌 NOTES FOR NEW CHAT

- Workspace path: `g:\My Drive\Web app\Yêu cầu công việc app\Ver 1.2.2`
- Main files: Check `DEPLOYMENT.md` và `DEPLOYMENT_CHECKLIST.md`
- Migration file: `supabase/migrations/0001_full_schema.sql`
- RLS file: `supabase/enable_rls_authenticated.sql`

---

## 🎯 EXPECTED OUTCOME

Sau khi chạy prompt này, bạn sẽ:
1. ✅ Code được push lên GitHub
2. ✅ Có hướng dẫn chi tiết deploy Vercel
3. ✅ Có hướng dẫn setup Supabase
4. ✅ Có hướng dẫn config Google OAuth
5. ✅ Có checklist để track progress

---

## ⚠️ BEFORE RUNNING PROMPT

Make sure:
- [ ] Code đã được test kỹ
- [ ] Build successful: `npm run build`
- [ ] Demo mode works: Check localhost:3000
- [ ] All deployment files created (DEPLOYMENT.md, etc.)
- [ ] GitHub account ready
- [ ] Vercel account ready (free tier OK)
- [ ] Supabase account ready (free tier OK)
- [ ] Google Cloud account ready

---

**Ready to deploy?** Copy prompt trên và paste vào chat mới! 🚀
