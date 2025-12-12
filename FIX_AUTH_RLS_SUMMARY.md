# 🔧 AUTH & RLS FIXES - COMPLETE SOLUTION

## 📋 Summary

Tôi đã phát hiện và sửa **5 vấn đề chính** liên quan đến xác thực và RLS policies:

### Vấn đề tìm thấy:
1. ❌ **RLS không cho phép tạo user mới** - policy trên `users` table không có INSERT rule đúng
2. ❌ **Không có RLS trên `user_roles`** - khi query roles, bị chặn và trả về empty
3. ❌ **Duplicate key errors khi auto-create** - vì RLS chặn SELECT nên app nghĩ user không tồn tại
4. ❌ **Không auto-assign default role** - user mới không có role nào
5. ❌ **Helper functions không bypass RLS** - `user_has_role()` không có SECURITY DEFINER

---

## ✅ Giải pháp

Tôi đã tạo 4 files:

### 1. **`supabase/0002_auto_fix_auth_rls.sql`** ⭐ **CHẠY CÁI NÀY TRƯỚC**
- Script tự động sửa tất cả RLS policies
- Tạo trigger auto-assign role
- Assign default role cho users hiện tại
- **Hành động**: Copy/paste vào Supabase SQL Editor và chạy

### 2. **`supabase/0002_fix_auth_rls.sql`** (Chi tiết từng bước)
- Cùng công việc nhưng chi tiết từng step
- Có comment giải thích từng phần
- Dùng nếu cần hiểu rõ cách sửa

### 3. **`supabase/0003_debug_auth_rls.sql`** (Xác minh)
- Queries để kiểm tra xem fix đã thành công chưa
- 14 diagnostic queries
- **Hành động**: Chạy để verify tất cả đã OK

### 4. **Updated `src/lib/auth/index.ts`**
- Error handling tốt hơn khi auto-create user
- Phân biệt giữa các loại errors (duplicate key vs permission denied)
- Logs chi tiết để debug
- **Hành động**: Copy vào project của bạn

### 5. **`FIX_AUTH_RLS_GUIDE.md`** (Hướng dẫn)
- Giải thích chi tiết các vấn đề
- Step-by-step implementation
- Testing checklist
- Troubleshooting tips

---

## 🚀 Hướng dẫn chạy (5 phút)

### Step 1: Chạy Migration (2 phút)
```
1. Đi vào Supabase Dashboard
2. SQL Editor → New Query
3. Copy toàn bộ nội dung từ: supabase/0002_auto_fix_auth_rls.sql
4. Click "Run" / Ctrl+Enter
5. Chờ xong (sẽ thấy verification queries)
```

**Expected Output:**
```
- CREATE POLICY ... ✓
- CREATE TRIGGER ... ✓
- INSERT ... (auto-assign roles)
- SELECT ... (verification)
```

### Step 2: Verify Fix (2 phút)
```
1. SQL Editor → New Query
2. Chạy những queries từ supabase/0003_debug_auth_rls.sql
3. Kiểm tra:
   ✅ Users table có 4 policies: select, insert, update, delete
   ✅ user_roles table có 4 policies
   ✅ Tất cả users có ít nhất 1 role
   ✅ user_has_role function returns true
   ✅ Trigger on_user_created_assign_role exists
```

### Step 3: Update Code (1 phút)
```
1. Copy nội dung file src/lib/auth/index.ts
2. Paste vào dự án của bạn: src/lib/auth/index.ts
3. Save file
```

### Step 4: Test (Tuỳ ý)
```
1. Signup với email mới
2. Check browser console: [AUTH] logs
3. Check Supabase: user được tạo + role được assign
4. Login: roles load đúng
5. Create request: thành công
```

---

## 🔍 Nếu vẫn có lỗi

### Lỗi: "User not found in users table"
```sql
-- Check user có tồn tại:
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Nếu tồn tại nhưng không có role:
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u
CROSS JOIN roles r
WHERE u.email = 'your-email@example.com' AND r.name = 'user';
```

### Lỗi: "Auto-create hit duplicate key"
```sql
-- Có thể là RLS vẫn chặn. Chạy diagnostic query:
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Nếu không có policy "users_insert", chạy lại migration
```

### Lỗi: Không thấy roles của user
```sql
-- Verify user_has_role function:
SELECT user_has_role('user-id-here'::uuid, 'user');

-- Nếu return false, check:
SELECT * FROM user_roles WHERE user_id = 'user-id-here'::uuid;
```

---

## 📊 Những gì đã thay đổi

### RLS Policies Changes:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **users** | ✅ Anyone | ✅ NEW: auth.uid()=id OR admin | ✅ Self or admin | ❌ Admin only |
| **user_roles** | ✅ NEW: Self or admin | ✅ NEW: Admin only | ✅ NEW: Admin only | ✅ NEW: Admin only |
| **roles** | ✅ NEW: Authenticated | ❌ None | ❌ None | ❌ None |
| **requests** | ✅ Unchanged | ✅ Unchanged | ✅ Unchanged | ✅ Unchanged |

### Code Changes in `src/lib/auth/index.ts`:

**Before:**
```typescript
if (createError) {
  if (errorCode === "23505") {
    return { roles: ["user"], ... };  // Vậy thôi
  }
  return { roles: [], ... };
}
```

**After:**
```typescript
if (createError) {
  if (errorCode === "23505") {
    console.warn("Duplicate key - profile exists but RLS blocked SELECT");
    return { roles: ["user"], ... };
  }
  if (errorCode === "42501") {
    console.error("RLS blocked INSERT - check users_insert policy");
    return { roles: [], ... };
  }
  return { roles: [], ... };
}
```

---

## ✅ Checklist

- [ ] Chạy `0002_auto_fix_auth_rls.sql` trong Supabase
- [ ] Chạy diagnostic queries từ `0003_debug_auth_rls.sql`
- [ ] Verify: Tất cả users có role
- [ ] Verify: user_has_role returns true
- [ ] Copy updated `src/lib/auth/index.ts` vào project
- [ ] Test signup với email mới
- [ ] Test login với email cũ
- [ ] Test create request
- [ ] Check console logs: no RLS errors

---

## 📚 Files Created/Updated

```
supabase/
  ├── 0002_auto_fix_auth_rls.sql     ← Chạy cái này
  ├── 0002_fix_auth_rls.sql           ← (Chi tiết)
  └── 0003_debug_auth_rls.sql         ← Verify sau khi chạy

src/lib/
  └── auth/index.ts                   ← Updated code

FIX_AUTH_RLS_GUIDE.md                 ← Hướng dẫn chi tiết
FIX_AUTH_RLS_SUMMARY.md               ← Cái này
```

---

## 🎯 Kết quả dự kiến

Sau khi áp dụng:

✅ User signup → auto-create profile → auto-assign 'user' role → can login  
✅ User login → load roles correctly → can access features  
✅ Create request → RLS allows → request saved  
✅ Admin actions → only admins → features hidden for users  
✅ No more RLS errors in console  

---

## 💬 Questions?

- Nếu vẫn có error, chạy `0003_debug_auth_rls.sql` để xem chi tiết
- Check browser console logs: `[AUTH] ...`
- Check Supabase logs: SQL queries
- Refer to `FIX_AUTH_RLS_GUIDE.md` cho chi tiết từng vấn đề

---

**Status: ✅ READY TO DEPLOY**

Tất cả files đã tạo và sẵn sàng để chạy.
