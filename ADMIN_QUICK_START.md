# 🎯 Hướng Dẫn Nhanh Cho Admin

**Target Audience**: Admin/DevOps muốn deploy nhanh  
**Time**: 30 phút

---

## 📋 TÓM TẮT 3 BƯỚC

```
1️⃣ Setup Supabase (15 phút)
   → Run 3 SQL files
   → Tạo storage bucket
   
2️⃣ Configure Google OAuth (10 phút)
   → Google Cloud Console
   → Enable trong Supabase
   
3️⃣ Test & Deploy (5 phút)
   → Test local với npm run dev
   → Deploy lên Vercel (optional)
```

---

## 1️⃣ SETUP SUPABASE

### Tạo Project
- URL: https://supabase.com
- Name: `yccv-production`
- Region: Singapore
- Get: Project URL, anon key, service_role key

### Run 3 SQL Files (trong SQL Editor)

**File 1**: `supabase/migrations/0001_init.sql`
```sql
-- Tạo schema: 10 tables
-- ✅ Check: Database → Tables thấy 10 tables
```

**File 2**: `supabase/enable_rls_authenticated.sql`
```sql
-- Enable RLS policies
-- ✅ Check: Không có error
```

**File 3**: `supabase/seed_complete.sql`
```sql
-- Seed whitelist + test data
-- ✅ Check: Thấy summary: 9 users, 11 requests
```

### Tạo Storage Bucket
- Name: `request-attachments`
- Public: OFF
- Add 3 policies (xem SETUP_GUIDE.md)

---

## 2️⃣ CONFIGURE GOOGLE OAUTH

### Google Cloud Console
1. Create project: `EIU Job Requests`
2. OAuth consent screen: Internal/External
3. Create OAuth Client ID (Web app)
4. Add origins:
   ```
   https://your-project.supabase.co
   http://localhost:3000
   ```
5. Add redirect:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Copy Client ID & Secret

### Supabase
1. Authentication → Providers → Google → ON
2. Paste Client ID & Secret
3. Save

---

## 3️⃣ TEST & DEPLOY

### Test Local

**File `.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

**Run**:
```bash
cd yccv-app
npm install
npm run dev
```

**Test**: http://localhost:3000
- Login với Google → whitelisted email → ✅ Dashboard
- Login với non-whitelisted email → ❌ Error

### Deploy (Optional)

**Vercel**:
1. Import from GitHub
2. Add 3 environment variables
3. Deploy
4. Update Google OAuth URLs

---

## 🔑 WHITELIST MANAGEMENT

### Add User
```sql
INSERT INTO users (email, is_active, unit_id, full_name)
VALUES ('new@eiu.edu.vn', true, 'unit-id', 'Full Name');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'new@eiu.edu.vn' AND r.name = 'user';
```

### Deactivate User
```sql
UPDATE users SET is_active = false WHERE email = 'user@eiu.edu.vn';
```

### View Whitelist
```sql
SELECT email, full_name, is_active FROM users ORDER BY created_at DESC;
```

---

## ✅ VERIFICATION CHECKLIST

Database:
- [ ] 10 tables created
- [ ] RLS enabled on all tables
- [ ] 9 whitelist users seeded
- [ ] Storage bucket created with policies

OAuth:
- [ ] Google OAuth client created
- [ ] Client ID & Secret added to Supabase
- [ ] Redirect URLs configured

App:
- [ ] `.env.local` configured
- [ ] `npm run dev` works
- [ ] Can login with whitelisted Google account
- [ ] Non-whitelisted accounts blocked
- [ ] Can create/view requests

---

## 🆘 COMMON ISSUES

**"Permission denied for table"**
→ Run `enable_rls_authenticated.sql` again

**"Not whitelisted" for valid user**
→ Check: `SELECT * FROM users WHERE email = '...'`
→ Verify: `is_active = true`

**OAuth redirect error**
→ Check authorized redirect URIs in Google Console

---

## 📞 SUPPORT

Chi tiết đầy đủ: [SETUP_GUIDE.md](SETUP_GUIDE.md)

**Status**: ✅ Production Ready
