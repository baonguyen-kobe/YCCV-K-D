# 🗄️ SUPABASE SETUP SCRIPT

## ⚠️ QUAN TRỌNG - ĐỌC TRƯỚC KHI CHẠY

Database hiện tại: **TRỐNG** (fresh project)
Project: **YCCV-KDD**
URL: https://jffinzioyizzuneqpwxl.supabase.co

---

## 📋 BƯỚC 1: RUN FULL SCHEMA MIGRATION

### 1.1. Vào Supabase SQL Editor
1. Vào https://supabase.com/dashboard/project/jffinzioyizzuneqpwxl
2. Left sidebar → **SQL Editor**
3. Click **New query**

### 1.2. Copy & Paste Migration
1. Mở file: `supabase/migrations/0001_full_schema.sql`
2. Copy **TOÀN BỘ** nội dung (1400+ lines)
3. Paste vào SQL Editor
4. Click **Run** (hoặc Ctrl + Enter)
5. Đợi ~5-10 giây

✅ **Expected result:** Success message, no errors

### 1.3. Verify Tables Created
1. Left sidebar → **Table Editor**
2. Should see 12+ tables:
   - roles
   - users
   - units
   - categories
   - requests
   - request_items
   - comments
   - user_roles
   - (và các tables khác)

---

## 📋 BƯỚC 2: ENABLE ROW LEVEL SECURITY

### 2.1. Run RLS Script
1. Vẫn trong SQL Editor
2. Click **New query** (tab mới)
3. Mở file: `supabase/enable_rls_authenticated.sql`
4. Copy toàn bộ nội dung
5. Paste vào SQL Editor
6. Click **Run**

✅ **Expected result:** "Commands completed successfully"

### 2.2. Verify RLS Enabled
1. Vào **Table Editor**
2. Click vào bất kỳ table nào (vd: `users`)
3. Should see 🔒 lock icon bên cạnh table name
4. Check tab "RLS Policies" → Should have policies listed

---

## 📋 BƯỚC 3: VERIFY SEED DATA

Migration file đã include seed data cơ bản:

### 3.1. Check Roles
```sql
SELECT * FROM roles ORDER BY name;
```
Expected: 4 roles (admin, manager, staff, user)

### 3.2. Check Units
```sql
SELECT * FROM units ORDER BY name;
```
Expected: 3 units (Nursing, Administration, IT)

### 3.3. Check Categories
```sql
SELECT * FROM categories ORDER BY name;
```
Expected: 3 categories (Equipment, Training, Other)

---

## 📋 BƯỚC 4: ADD ADMIN USER (QUAN TRỌNG)

### 4.1. Thêm Admin User Đầu Tiên
**Thay email bằng email bạn sẽ dùng để login:**

```sql
-- 1. Add admin user
INSERT INTO users (id, email, full_name, created_at)
VALUES (
  gen_random_uuid(),
  'your-email@eiu.edu.vn',  -- ⚠️ THAY ĐỔI EMAIL NÀY
  'Admin User',              -- ⚠️ THAY ĐỔI TÊN NÀY
  now()
);

-- 2. Assign admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'your-email@eiu.edu.vn'  -- ⚠️ THAY ĐỔI EMAIL NÀY
  AND r.name = 'admin';

-- 3. Verify
SELECT 
  u.email, 
  u.full_name, 
  r.name as role,
  u.created_at
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'your-email@eiu.edu.vn';  -- ⚠️ THAY ĐỔI EMAIL NÀY
```

✅ **Expected:** 1 row returned với email, tên, và role = 'admin'

### 4.2. Add Thêm Test Users (Optional)
```sql
-- Manager user
INSERT INTO users (id, email, full_name, unit_id, created_at)
SELECT 
  gen_random_uuid(),
  'manager@eiu.edu.vn',
  'Manager Test',
  u.id,
  now()
FROM units u
WHERE u.name = 'Nursing'
LIMIT 1;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'manager@eiu.edu.vn'
  AND r.name = 'manager';

-- Staff user
INSERT INTO users (id, email, full_name, created_at)
VALUES (
  gen_random_uuid(),
  'staff@eiu.edu.vn',
  'Staff Test',
  now()
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'staff@eiu.edu.vn'
  AND r.name = 'staff';
```

---

## 📋 BƯỚC 5: CONFIGURE AUTHENTICATION

### 5.1. Enable Google OAuth
1. Vào **Authentication** → **Providers**
2. Tìm **Google**
3. Toggle ON
4. Điền credentials từ Google Cloud Console (xem OAUTH_SETUP.md):
   ```
   Client ID: [YOUR_GOOGLE_CLIENT_ID]
   Client Secret: [YOUR_GOOGLE_CLIENT_SECRET]
   ```
   ⚠️ **IMPORTANT**: Get actual values from `.env.production.local` file (NOT committed to Git)
5. Click **Save**

### 5.2. Configure URL Settings
1. Vào **Authentication** → **URL Configuration**
2. Điền:
   ```
   Site URL: https://yccv-kdd.vercel.app
   
   Redirect URLs (add these):
   http://localhost:3000/**
   https://yccv-kdd.vercel.app/**
   ```
3. Click **Save**

---

## 📋 BƯỚC 6: TEST DATABASE

### 6.1. Test RPC Functions
```sql
-- Test user whitelist check
SELECT check_user_whitelist('your-email@eiu.edu.vn');
-- Expected: true

SELECT check_user_whitelist('not-whitelisted@example.com');
-- Expected: false
```

### 6.2. Test Permissions
```sql
-- Check admin can see everything
SELECT COUNT(*) FROM requests;
-- Should work (0 rows since no requests yet)

-- Test RLS
SET request.jwt.claims = '{"sub": "some-random-uuid"}';
SELECT COUNT(*) FROM requests;
-- Should return 0 (RLS working)
```

---

## ✅ VERIFICATION CHECKLIST

Run through this checklist:

- [ ] Migration completed successfully
- [ ] RLS enabled on all tables (🔒 icon visible)
- [ ] 4 roles exist (admin, manager, staff, user)
- [ ] 3 units exist
- [ ] 3 categories exist
- [ ] Admin user added với email bạn sử dụng
- [ ] Admin user có role 'admin'
- [ ] Google OAuth enabled in Supabase
- [ ] Redirect URLs configured
- [ ] RPC functions work (check_user_whitelist)
- [ ] No errors in Supabase logs

---

## 🐛 TROUBLESHOOTING

### Issue: Migration fails với foreign key error
```
Fix: Run DROP SCHEMA first:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

Then run migration again.
```

### Issue: RLS policies not working
```
Fix: Run enable_rls_authenticated.sql again
Verify: Check Table Editor → RLS tab
```

### Issue: Cannot insert admin user
```
Fix: Check roles table has data:
SELECT * FROM roles;

If empty, run seed data portion of migration again.
```

### Issue: check_user_whitelist returns NULL
```
Fix: User doesn't exist in users table
Add user first, then test again.
```

---

## 📊 DATABASE STATS

After setup, you should have:
- **Tables:** 12+ tables
- **Roles:** 4 roles
- **Units:** 3 units
- **Categories:** 3 categories
- **Users:** 1+ (your admin user)
- **RLS Policies:** 50+ policies across all tables
- **RPC Functions:** 4 functions

---

## 🎉 NEXT STEPS

After Supabase setup complete:

1. ✅ Update Vercel environment variables
2. ✅ Redeploy Vercel
3. ✅ Test login với Google OAuth
4. ✅ Verify admin can access all features

See: `VERCEL_UPDATE_GUIDE.md` for next steps

---

**Database:** jffinzioyizzuneqpwxl  
**Region:** Singapore  
**Status:** ✅ Ready for Production  
**Last Updated:** December 12, 2025
