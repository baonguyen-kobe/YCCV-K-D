# Hướng dẫn Setup Supabase thủ công

**Last Updated**: 2025-12-11  
**Project**: Job Request Management System

---

## 📋 CHECKLIST SETUP

- [ ] Tạo Supabase project
- [ ] Chạy migration (database schema)
- [ ] Setup Google OAuth
- [ ] Tạo Storage bucket cho attachments
- [ ] Chạy seed data (tùy chọn - DEV only)
- [ ] Cập nhật env variables vào `.env.local`

---

## BƯỚC 1: TẠO SUPABASE PROJECT

### 1.1 Đăng ký/Đăng nhập Supabase
1. Truy cập: https://supabase.com
2. Đăng nhập hoặc tạo tài khoản mới (có thể dùng GitHub login)

### 1.2 Tạo Project mới
1. Nhấn **"New Project"**
2. Điền thông tin:
   - **Name**: `yccv-job-requests` (hoặc tên tùy ý)
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại để dùng sau)
   - **Region**: Chọn `Southeast Asia (Singapore)` (gần VN nhất)
   - **Pricing Plan**: Chọn **Free** (đủ cho development)
3. Nhấn **"Create new project"**
4. Đợi ~2 phút để project setup xong

### 1.3 Lấy thông tin kết nối
Sau khi project tạo xong:

1. Vào **Settings** (biểu tượng ⚙️ bên trái)
2. Chọn **API**
3. Copy các thông tin sau:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET - không commit)
```

4. Tạo file `.env.local` trong thư mục `yccv-app/`:

```bash
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin operations (keep secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Optional - skip for now)
# RESEND_API_KEY=re_...
```

✅ **CHECKPOINT**: File `.env.local` đã tạo với 3 variables

---

## BƯỚC 2: CHẠY DATABASE MIGRATION

### 2.1 Cài đặt Supabase CLI (nếu chưa có)

**Windows (PowerShell):**
```powershell
scoop install supabase
# Hoặc dùng npm:
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
# Output: 1.xxx.x
```

### 2.2 Link Project với Local

Từ thư mục `yccv-app/`:

```bash
# Đăng nhập Supabase CLI
supabase login

# Link với project đã tạo
supabase link --project-ref xxxxxxxxxxxxx
# Nhập database password (lúc tạo project)
```

**Lấy Project Reference ID:**
- Vào Supabase Dashboard → Settings → General
- Copy **Reference ID** (dạng: `xxxxxxxxxxxxx`)

### 2.3 Chạy Migration

```bash
cd d:\YCCV\yccv-app

# Chạy migration file
supabase db push

# Hoặc nếu lỗi, chạy trực tiếp:
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < supabase/migrations/0001_init.sql
```

**Expected Output:**
```
Applying migration 0001_init.sql...
✔ Migration applied successfully
```

### 2.4 Verify trong Dashboard

1. Vào Supabase Dashboard → **Table Editor**
2. Kiểm tra các bảng đã tạo:
   - ✅ units (2 rows)
   - ✅ roles (4 rows)
   - ✅ users (0 rows - chưa có data)
   - ✅ user_roles
   - ✅ categories (4 rows)
   - ✅ requests
   - ✅ request_items
   - ✅ request_comments
   - ✅ attachments
   - ✅ request_logs
   - ✅ auth_logs

✅ **CHECKPOINT**: 10 bảng đã tạo, seed data có units/roles/categories

---

## BƯỚC 3: SETUP GOOGLE OAUTH

### 3.1 Tạo Google Cloud Project

1. Truy cập: https://console.cloud.google.com
2. Tạo project mới: **"EIU Job Requests"**
3. Chọn project vừa tạo

### 3.2 Configure OAuth Consent Screen

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **External** (hoặc Internal nếu có Google Workspace)
3. Điền thông tin:
   - **App name**: `EIU Job Request System`
   - **User support email**: your-email@eiu.edu.vn
   - **Developer contact**: your-email@eiu.edu.vn
4. Nhấn **Save and Continue**
5. Scopes: Nhấn **Add or Remove Scopes**
   - Chọn: `email`, `profile`, `openid`
6. Nhấn **Save and Continue** (skip Test users cho External app)

### 3.3 Tạo OAuth Credentials

1. Vào **APIs & Services** → **Credentials**
2. Nhấn **Create Credentials** → **OAuth client ID**
3. Chọn **Application type**: `Web application`
4. Điền thông tin:
   - **Name**: `Supabase Auth`
   - **Authorized JavaScript origins**: 
     ```
     https://xxxxxxxxxxxxx.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```
5. Nhấn **Create**
6. Copy **Client ID** và **Client Secret** (lưu lại)

### 3.4 Configure trong Supabase

1. Vào Supabase Dashboard → **Authentication** → **Providers**
2. Tìm **Google** provider
3. Toggle **Enable Sign in with Google**
4. Paste:
   - **Client ID**: (từ Google Cloud Console)
   - **Client Secret**: (từ Google Cloud Console)
5. Nhấn **Save**

### 3.5 Test OAuth Flow

1. Vào Supabase Dashboard → **Authentication** → **URL Configuration**
2. Kiểm tra:
   - **Site URL**: `http://localhost:3000` (cho dev)
   - **Redirect URLs**: Thêm `http://localhost:3000/auth/callback`

✅ **CHECKPOINT**: Google OAuth đã enable trong Supabase

---

## BƯỚC 4: TẠO STORAGE BUCKET

### 4.1 Tạo Bucket

1. Vào Supabase Dashboard → **Storage**
2. Nhấn **Create a new bucket**
3. Điền thông tin:
   - **Name**: `request-attachments`
   - **Public bucket**: ❌ **TẮT** (Private - chỉ authenticated users)
4. Nhấn **Create bucket**

### 4.2 Setup Policies

1. Click vào bucket `request-attachments`
2. Chọn tab **Policies**
3. Nhấn **New Policy**

**Policy 1: Upload files (authenticated users)**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-attachments');
```

**Policy 2: Read files (authenticated users)**
```sql
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'request-attachments');
```

**Policy 3: Delete own files**
```sql
CREATE POLICY "Allow delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'request-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

✅ **CHECKPOINT**: Bucket `request-attachments` đã tạo với 3 policies

---

## BƯỚC 5: CHẠY SEED DATA (TÙY CHỌN - CHỈ DEV)

### 5.1 Tạo Users & Auth Accounts

**Quan trọng**: Seed data cần chạy **2 scripts** vì:
- Script 1: Tạo auth accounts trong `auth.users` (Supabase Auth)
- Script 2: Tạo data trong `public.users` + phiếu requests

#### Script 1: Seed Auth Users

Tạo file `supabase/seed_auth_users.sql`:

```sql
-- Seed Auth Users (Supabase Auth Schema)
-- Run this FIRST via Dashboard SQL Editor

-- Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@eiu.edu.vn',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nguyễn Admin"}'
);

-- Manager 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manager01@eiu.edu.vn',
  crypt('Manager@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Trần Quản Lý"}'
);

-- Staff 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staff01@eiu.edu.vn',
  crypt('Staff@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Lê Chuyên Viên"}'
);

-- Lecturer 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lecturer01@eiu.edu.vn',
  crypt('User@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Võ Giảng Viên"}'
);
```

**Chạy Script 1:**
1. Vào Supabase Dashboard → **SQL Editor**
2. Paste nội dung script trên
3. Nhấn **Run** (hoặc Ctrl+Enter)
4. Verify: Vào **Authentication** → **Users** → thấy 4 users

#### Script 2: Seed Public Data

File này đã có sẵn: `supabase/seed_complete.sql`

**Chạy Script 2:**

```bash
cd d:\YCCV\yccv-app

# Via CLI
supabase db reset
supabase db push
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < supabase/seed_complete.sql

# Hoặc via Dashboard SQL Editor:
# Copy toàn bộ nội dung seed_complete.sql và Run
```

### 5.2 Script Helper: Add Profile & Role

Sau khi chạy script trên, cần link auth users với public.users:

Tạo file `scripts/add-profile-role.ts`:

```typescript
/**
 * Helper script: Add user to public.users and assign role
 * Usage: npx tsx scripts/add-profile-role.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUser(
  email: string,
  fullName: string,
  unitId: string,
  roleIds: string[]
) {
  // 1. Get auth user ID
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const user = authUser.users.find((u) => u.email === email);
  
  if (!user) {
    console.error(`❌ Auth user not found: ${email}`);
    return;
  }

  // 2. Insert into public.users
  const { error: userError } = await supabase.from('users').upsert({
    id: user.id,
    email,
    full_name: fullName,
    unit_id: unitId,
    is_active: true,
  });

  if (userError) {
    console.error(`❌ Error inserting user: ${userError.message}`);
    return;
  }

  // 3. Assign roles
  for (const roleId of roleIds) {
    await supabase.from('user_roles').upsert({
      user_id: user.id,
      role_id: roleId,
    });
  }

  console.log(`✅ Added user: ${email} with ${roleIds.length} roles`);
}

async function main() {
  // Get unit/role IDs
  const { data: units } = await supabase.from('units').select('id, name');
  const { data: roles } = await supabase.from('roles').select('id, name');

  console.log('\n📋 Available Units:', units);
  console.log('📋 Available Roles:', roles);

  const nursingUnit = units?.find((u) => u.name === 'Khoa Điều dưỡng')?.id;
  const adminRole = roles?.find((r) => r.name === 'Admin')?.id;
  const managerRole = roles?.find((r) => r.name === 'Manager')?.id;
  const staffRole = roles?.find((r) => r.name === 'Staff')?.id;
  const userRole = roles?.find((r) => r.name === 'User')?.id;

  console.log('\n🔄 Adding users...\n');

  // Add 4 test users
  await addUser('admin@eiu.edu.vn', 'Nguyễn Admin', nursingUnit!, [adminRole!]);
  await addUser('manager01@eiu.edu.vn', 'Trần Quản Lý', nursingUnit!, [managerRole!]);
  await addUser('staff01@eiu.edu.vn', 'Lê Chuyên Viên', nursingUnit!, [staffRole!]);
  await addUser('lecturer01@eiu.edu.vn', 'Võ Giảng Viên', nursingUnit!, [userRole!]);

  console.log('\n✅ All users added successfully!');
}

main();
```

**Chạy script:**
```bash
cd d:\YCCV\yccv-app
npx tsx scripts/add-profile-role.ts
```

### 5.3 Verify Seed Data

1. Vào Supabase Dashboard → **Table Editor**
2. Kiểm tra:
   - **auth.users**: 4 users
   - **public.users**: 4 users (same IDs)
   - **user_roles**: 4 mappings
   - **requests**: 0 rows (sẽ tạo khi test)

✅ **CHECKPOINT**: 4 test users đã tạo và có thể login

---

## BƯỚC 6: VERIFY SETUP

### 6.1 Test Database Connection

Tạo file test `scripts/test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  // Test 1: Fetch units
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('*');

  if (unitsError) {
    console.error('❌ Units query failed:', unitsError);
  } else {
    console.log('✅ Units:', units?.length, 'rows');
  }

  // Test 2: Fetch roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*');

  if (rolesError) {
    console.error('❌ Roles query failed:', rolesError);
  } else {
    console.log('✅ Roles:', roles?.length, 'rows');
  }

  // Test 3: Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) {
    console.error('❌ Categories query failed:', categoriesError);
  } else {
    console.log('✅ Categories:', categories?.length, 'rows');
  }
}

testConnection();
```

**Chạy test:**
```bash
cd d:\YCCV\yccv-app
npx tsx scripts/test-connection.ts

# Expected output:
# ✅ Units: 2 rows
# ✅ Roles: 4 rows
# ✅ Categories: 4 rows
```

### 6.2 Test Auth Flow

```bash
cd d:\YCCV\yccv-app
npm run dev
```

1. Mở browser: http://localhost:3000
2. Redirect tự động → http://localhost:3000/login
3. Thử đăng nhập:
   - Email: `admin@eiu.edu.vn`
   - Password: `Admin@123`
4. ✅ Redirect → `/dashboard`

### 6.3 Test Whitelist Check

1. Thử login với email KHÔNG có trong users table:
   - Nhấn **"Đăng nhập với Google"**
   - Chọn email không phải @eiu.edu.vn
2. ✅ Expected: Quay lại `/login?error=not_whitelisted`
3. ✅ Thông báo: "Tài khoản của bạn chưa được cấp quyền truy cập"

---

## 🎯 CHECKLIST HOÀN THÀNH

Kiểm tra lại toàn bộ setup:

- [ ] ✅ Supabase project đã tạo
- [ ] ✅ File `.env.local` có đầy đủ 3 variables
- [ ] ✅ Migration đã chạy (10 bảng)
- [ ] ✅ Google OAuth đã enable
- [ ] ✅ Storage bucket `request-attachments` với 3 policies
- [ ] ✅ (Optional) Seed data: 4 users đã tạo
- [ ] ✅ Test connection script chạy thành công
- [ ] ✅ Test login với `admin@eiu.edu.vn` thành công
- [ ] ✅ Whitelist check hoạt động (block non-whitelisted users)

---

## 🚨 TROUBLESHOOTING

### Lỗi: "relation 'public.users' does not exist"
→ Migration chưa chạy. Chạy lại `supabase db push`

### Lỗi: "Invalid login credentials"
→ User chưa có trong auth.users. Chạy seed_auth_users.sql

### Lỗi: "Failed to fetch" khi query
→ Kiểm tra NEXT_PUBLIC_SUPABASE_URL và ANON_KEY trong .env.local

### Google OAuth lỗi "redirect_uri_mismatch"
→ Kiểm tra lại Authorized redirect URIs trong Google Cloud Console

### Storage upload lỗi "new row violates policy"
→ Kiểm tra lại 3 policies đã tạo đúng bucket `request-attachments`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs: Supabase Dashboard → **Logs** → **Postgres Logs**
2. Test query trong **SQL Editor** để debug
3. Verify RLS policies: **Authentication** → **Policies**

---

**Next Steps**: Sau khi setup Supabase xong → Đọc `DEPLOYMENT_GUIDE.md` để deploy lên Vercel
