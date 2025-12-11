# Google OAuth Only Setup Guide

## Overview
This application has been configured to use **Google OAuth only** with email whitelist checking. Local email/password authentication has been completely removed.

## Setup Steps

### 1. Supabase Configuration
1. Go to [Supabase Console](https://supabase.com)
2. Select project `gpqtsspvskqtlsfsrame`
3. Enable Google OAuth provider:
   - Auth → Providers → Google
   - Add your Google OAuth credentials
   - Set redirect URL: `http://localhost:3000/auth/callback`

### 2. Environment Variables
Create `.env.local` in the `yccv-app` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gpqtsspvskqtlsfsrame.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth (from Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Database Setup

#### A. Run Migrations (First Time Only)
```sql
-- Run the 0001_init.sql migration in Supabase SQL Editor
-- This creates all tables and schema
```

#### B. Enable RLS Policies
1. Go to Supabase SQL Editor
2. Copy and run [enable_rls_authenticated.sql](supabase/enable_rls_authenticated.sql)
   - This enables RLS on all tables
   - Allows any authenticated user to read/write

#### C. Seed Whitelist Users
1. Go to Supabase → Authentication → Users
2. OR run the seed script to create test users

**Test whitelist users for local testing:**

| Email | Password | Role | Unit |
|-------|----------|------|------|
| admin@eiu.edu.vn | Admin@123 | Admin | EIU |
| manager01@eiu.edu.vn | Manager@123 | Manager | EIU |
| staff01@eiu.edu.vn | Staff@123 | Staff | EIU |
| lecturer01@eiu.edu.vn | User@123 | Lecturer | EIU |

**In production:** Use your institution's email domain and admin console to manage the whitelist.

### 4. Run the Application
```bash
cd yccv-app
npm install
npm run dev
```

Access: http://localhost:3001

## How It Works

### Authentication Flow
1. User clicks "Đăng nhập với Google" on login page
2. Redirected to Google OAuth consent screen
3. After consent → `src/app/auth/callback/route.ts`
4. Callback handler:
   - ✅ Verifies user email is in whitelist (users table)
   - ✅ Checks `is_active = true`
   - ✅ Auto-creates/updates user profile from Google metadata
   - ❌ Denies access if not whitelisted → shows error on `/login?error=not_whitelisted`

### Database Structure
- **users table**: Contains whitelist + user profiles
  - `id`: UUID from auth.users
  - `email`: From Google OAuth
  - `is_active`: Whitelist status (set by admin)
  - `unit_id`: User's unit (set during whitelist creation)
  - `full_name`: Auto-filled from Google name
  - `phone`: Optional

## Whitelist Management

### For Administrators

#### Add New User to Whitelist (Supabase Console)
```sql
INSERT INTO users (
  email,
  is_active,
  unit_id,
  full_name,
  phone
) VALUES (
  'newuser@eiu.edu.vn',
  true,
  'unit-uuid-here',
  'New User Full Name',
  '+84-123-456-789'
);
```

#### Deactivate User
```sql
UPDATE users
SET is_active = false
WHERE email = 'user@eiu.edu.vn';
```

## File Changes

### Deleted Files (No Longer Needed)
- `scripts/seed-auth-users.ts` - Local user seeding removed
- `scripts/add-profile-role.ts` - Replaced by OAuth callback
- `supabase/fix_all_rls.sql` - Temporary fixes cleaned up
- `supabase/fix_security_warnings.sql` - Temporary fixes cleaned up
- `supabase/fix_users_rls.sql` - Temporary fixes cleaned up

### Modified Files
- `src/app/(auth)/login/page.tsx` - Only Google OAuth button
- `src/app/auth/callback/route.ts` - Whitelist check + profile auto-creation
- `src/app/page.tsx` - Redirect logic (login if not auth, dashboard if auth)

## Troubleshooting

### "Permission denied for table requests"
1. Ensure `enable_rls_authenticated.sql` is run
2. Check RLS policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

### "User not whitelisted"
1. Check user exists in whitelist: `SELECT * FROM users WHERE email = 'user@eiu.edu.vn';`
2. Verify `is_active = true`
3. Check `unit_id` is set correctly

### Google OAuth Not Working
1. Verify redirect URL in Supabase matches your domain
2. Check environment variables in `.env.local`
3. Ensure Google OAuth is enabled in Supabase

## Email Template Customization

When users are denied access, customize the message in:
- [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) line ~30

## Next Steps (Optional)
- [ ] Implement role-based permissions (admin, manager, staff, lecturer)
- [ ] Add email notification on whitelist add/removal
- [ ] Create admin panel for whitelist management
- [ ] Set up email verification before first login
