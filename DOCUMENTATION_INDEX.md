# 📚 YCCV Documentation Index

**Hệ thống quản lý yêu cầu vật tư với Google OAuth + Whitelist**

---

## 🚀 QUICK START

Chọn 1 trong 3 guides dựa theo nhu cầu:

| Guide | Audience | Time | File |
|-------|----------|------|------|
| **Admin Quick Start** | Admin/DevOps | 30 phút | [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) |
| **Quick Start** | Developer | 45 phút | [QUICK_START.md](QUICK_START.md) |
| **Setup Guide** | Chi tiết đầy đủ | 45 phút | [SETUP_GUIDE.md](SETUP_GUIDE.md) |

**Khuyến nghị**: Đọc [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) cho overview nhanh, sau đó xem [SETUP_GUIDE.md](SETUP_GUIDE.md) cho chi tiết.

---

## 📖 CORE DOCUMENTATION

### Setup & Configuration

| File | Purpose | When to Read |
|------|---------|--------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Chi tiết setup từ đầu | Lần đầu setup |
| [WHITELIST_SETUP.md](WHITELIST_SETUP.md) | Quản lý whitelist | Thêm/xóa users |
| [OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md) | Google OAuth chi tiết | Troubleshoot OAuth |
| [RLS_FIX_QUICK.md](RLS_FIX_QUICK.md) | Fix permission errors | Lỗi RLS |

### Database & Files

| File | Purpose | When to Run |
|------|---------|-------------|
| `supabase/migrations/0001_init.sql` | Tạo schema | Lần đầu setup |
| `supabase/enable_rls_authenticated.sql` | Enable RLS | Sau migration |
| `supabase/seed_complete.sql` | Seed whitelist + data | Testing locally |

### Migration Notes

| File | Purpose | Status |
|------|---------|--------|
| [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) | Files deleted/updated | ✅ Completed |
| Files deleted: `TEST_CREDENTIALS.md`, `TEST_CHECKLIST.md`, `seed-auth-users.*` | Old email/password auth | ❌ No longer used |

---

## 🏗️ ARCHITECTURE

### Authentication Flow

```mermaid
graph LR
    A[User] -->|Click Google Login| B[Google OAuth]
    B -->|Consent| C[/auth/callback]
    C -->|Check email| D{In Whitelist?}
    D -->|Yes| E[Create/Update Profile]
    D -->|No| F[Sign Out + Error]
    E --> G[Redirect to /dashboard]
    F --> H[Redirect to /login]
```

### Database Structure

```
10 Tables:
├── units (Departments/Units)
├── roles (admin, manager, staff, user)
├── users (Whitelist + Profiles) ⭐
├── user_roles (Many-to-many)
├── categories (Request categories)
├── requests (Job requests) ⭐
├── request_items (Items in request)
├── request_comments (Comments)
├── attachments (File uploads)
└── request_logs (Status changes)

⭐ = Core tables for authentication & workflow
```

### File Structure

```
yccv-app/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          Google OAuth button
│   │   ├── auth/callback/         Whitelist check ⭐
│   │   └── (dashboard)/           Protected routes
│   └── lib/
│       ├── supabase/              Client & Server
│       └── permissions.ts         Role checks
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql         Schema
│   ├── enable_rls_authenticated.sql  RLS policies ⭐
│   └── seed_complete.sql         Test data
└── Documentation (This folder)
```

---

## 🔐 WHITELIST MANAGEMENT

### Commands

**View whitelist**:
```sql
SELECT email, full_name, is_active, created_at
FROM users
ORDER BY created_at DESC;
```

**Add user**:
```sql
INSERT INTO users (email, is_active, unit_id, full_name)
VALUES ('new@eiu.edu.vn', true, 'unit-uuid', 'Full Name');

-- Assign role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'new@eiu.edu.vn' AND r.name = 'user';
```

**Deactivate**:
```sql
UPDATE users SET is_active = false WHERE email = 'user@eiu.edu.vn';
```

**Reactivate**:
```sql
UPDATE users SET is_active = true WHERE email = 'user@eiu.edu.vn';
```

---

## 🧪 TESTING

### Local Testing

```bash
cd yccv-app
npm run dev
```

**Test Cases**:
1. ✅ Whitelisted email → Dashboard
2. ❌ Non-whitelisted email → Error
3. ✅ Create request as Lecturer
4. ✅ Admin can see all requests
5. ✅ Manager can assign requests
6. ✅ Staff can update status

### Manual Testing

Xem [WHITELIST_SETUP.md](WHITELIST_SETUP.md) section "Testing"

---

## 🆘 TROUBLESHOOTING

### Common Issues

| Error | Solution | Reference |
|-------|----------|-----------|
| "Permission denied for table" | Run `enable_rls_authenticated.sql` | [RLS_FIX_QUICK.md](RLS_FIX_QUICK.md) |
| "Not whitelisted" | Check `users` table | [WHITELIST_SETUP.md](WHITELIST_SETUP.md) |
| "redirect_uri_mismatch" | Update Google Console | [OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md) |
| Profile not auto-created | Check callback route | [SETUP_GUIDE.md](SETUP_GUIDE.md) |

### Debug Steps

1. Check Supabase logs: Dashboard → Logs
2. Check browser console (F12)
3. Verify whitelist: `SELECT * FROM users WHERE email = '...'`
4. Test RLS: Run queries in SQL Editor as authenticated user

---

## 📦 DEPLOYMENT

### Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Production (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Update OAuth redirect URLs
5. Deploy

Xem [SETUP_GUIDE.md](SETUP_GUIDE.md) Bước 5 cho chi tiết.

---

## 🎯 KEY CONCEPTS

### Whitelist
- Email được phép login lưu trong `users` table
- `is_active = true` → Cho phép login
- `is_active = false` → Chặn login
- Profile tự động tạo từ Google metadata

### Roles
- **Admin**: Toàn quyền
- **Manager**: Quản lý requests trong unit
- **Staff**: Xử lý requests được assign
- **User/Lecturer**: Tạo requests

### RLS (Row Level Security)
- Authenticated users → Full access (simple model)
- Future: Role-based restrictions per table

---

## 📞 SUPPORT

**Questions?** Check these files in order:
1. [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) - Quick overview
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed steps
3. [RLS_FIX_QUICK.md](RLS_FIX_QUICK.md) - Permission errors
4. [WHITELIST_SETUP.md](WHITELIST_SETUP.md) - User management

**Still stuck?** Check:
- Supabase Dashboard logs
- Browser console (F12)
- Network tab for API errors

---

## ✅ CHECKLIST

### Initial Setup
- [ ] Supabase project created
- [ ] 3 SQL files executed (init, RLS, seed)
- [ ] Storage bucket created
- [ ] Google OAuth configured
- [ ] `.env.local` configured
- [ ] App runs locally (`npm run dev`)

### Testing
- [ ] Can login with whitelisted email
- [ ] Non-whitelisted email blocked
- [ ] Profile auto-created on first login
- [ ] Can create request
- [ ] Admin can see all requests
- [ ] Permissions work correctly

### Production (Optional)
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] OAuth URLs updated
- [ ] Production testing complete

---

**Last Updated**: 2025-12-11  
**Status**: ✅ Production Ready  
**Authentication**: Google OAuth Only + Email Whitelist
