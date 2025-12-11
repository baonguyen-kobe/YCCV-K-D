/**
 * Seed Auth Users Script
 * ======================
 * Creates auth users using Supabase Admin API (the correct way)
 * 
 * Usage:
 *   npx tsx scripts/seed-auth-users.ts
 * 
 * Prerequisites:
 *   - .env.local must have SUPABASE_SERVICE_ROLE_KEY
 *   - Run migration first (0001_init.sql)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Define test users
const testUsers = [
  {
    email: 'admin@eiu.edu.vn',
    password: 'Admin@123',
    fullName: 'Nguyễn Admin',
    phone: '0901000001',
    unitCode: 'PHONG-TCHC', // Phòng Tổ chức - Hành chính
    roles: ['admin'],
  },
  {
    email: 'manager01@eiu.edu.vn',
    password: 'Manager@123',
    fullName: 'Trần Quản Lý',
    phone: '0901000002',
    unitCode: 'PHONG-TCHC',
    roles: ['manager'],
  },
  {
    email: 'manager02@eiu.edu.vn',
    password: 'Manager@123',
    fullName: 'Phạm Quản Lý',
    phone: '0901000003',
    unitCode: 'KHOA-KTCN', // Khoa Kỹ thuật - Công nghệ
    roles: ['manager'],
  },
  {
    email: 'staff01@eiu.edu.vn',
    password: 'Staff@123',
    fullName: 'Lê Chuyên Viên',
    phone: '0901000004',
    unitCode: 'PHONG-TCHC',
    roles: ['staff'],
  },
  {
    email: 'staff02@eiu.edu.vn',
    password: 'Staff@123',
    fullName: 'Hoàng Chuyên Viên',
    phone: '0901000005',
    unitCode: 'PHONG-TCHC',
    roles: ['staff'],
  },
  {
    email: 'lecturer01@eiu.edu.vn',
    password: 'User@123',
    fullName: 'Võ Giảng Viên',
    phone: '0901000006',
    unitCode: 'KHOA-KTCN',
    roles: ['user'],
  },
  {
    email: 'lecturer02@eiu.edu.vn',
    password: 'User@123',
    fullName: 'Đỗ Giảng Viên',
    phone: '0901000007',
    unitCode: 'KHOA-KTCN',
    roles: ['user'],
  },
  {
    email: 'lecturer03@eiu.edu.vn',
    password: 'User@123',
    fullName: 'Bùi Giảng Viên',
    phone: '0901000008',
    unitCode: 'KHOA-QTKD', // Khoa Quản trị Kinh doanh
    roles: ['user'],
  },
  {
    email: 'multiuser@eiu.edu.vn',
    password: 'Multi@123',
    fullName: 'Nguyễn Đa Vai Trò',
    phone: '0901000009',
    unitCode: 'PHONG-TCHC',
    roles: ['manager', 'staff'],
  },
];

// Define units
const units = [
  { code: 'PHONG-TCHC', name: 'Phòng Tổ chức - Hành chính', parent: null },
  { code: 'PHONG-TCKT', name: 'Phòng Tài chính - Kế toán', parent: null },
  { code: 'PHONG-KHCN', name: 'Phòng Khoa học - Công nghệ', parent: null },
  { code: 'KHOA-KTCN', name: 'Khoa Kỹ thuật - Công nghệ', parent: null },
  { code: 'KHOA-QTKD', name: 'Khoa Quản trị Kinh doanh', parent: null },
  { code: 'KHOA-NN', name: 'Khoa Ngoại ngữ', parent: null },
];

// Define roles
const roles = [
  { code: 'admin', name: 'Quản trị viên', description: 'Toàn quyền quản trị hệ thống' },
  { code: 'manager', name: 'Quản lý đơn vị', description: 'Quản lý và duyệt yêu cầu của đơn vị' },
  { code: 'staff', name: 'Chuyên viên xử lý', description: 'Xử lý và theo dõi yêu cầu' },
  { code: 'user', name: 'Người dùng', description: 'Tạo và theo dõi yêu cầu cá nhân' },
];

async function seedUnits() {
  console.log('\n📁 Seeding units...');
  
  for (const unit of units) {
    const { error } = await supabase
      .from('units')
      .upsert({ 
        code: unit.code, 
        name: unit.name, 
        parent_id: null,
        is_active: true 
      }, { onConflict: 'code' });
    
    if (error) {
      console.error(`   ❌ Failed to create unit ${unit.code}:`, error.message);
    } else {
      console.log(`   ✓ Unit: ${unit.name}`);
    }
  }
}

async function seedRoles() {
  console.log('\n👥 Seeding roles...');
  
  for (const role of roles) {
    const { error } = await supabase
      .from('roles')
      .upsert({ 
        code: role.code, 
        name: role.name, 
        description: role.description,
        is_active: true 
      }, { onConflict: 'code' });
    
    if (error) {
      console.error(`   ❌ Failed to create role ${role.code}:`, error.message);
    } else {
      console.log(`   ✓ Role: ${role.name}`);
    }
  }
}

async function seedUsers() {
  console.log('\n👤 Seeding users...');
  
  // Get unit and role mappings
  const { data: unitData } = await supabase.from('units').select('id, code');
  const { data: roleData } = await supabase.from('roles').select('id, code');
  
  const unitMap = new Map(unitData?.map(u => [u.code, u.id]) || []);
  const roleMap = new Map(roleData?.map(r => [r.code, r.id]) || []);
  
  for (const user of testUsers) {
    console.log(`\n   Processing: ${user.email}`);
    
    // Step 1: Create auth user using Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: user.fullName,
      },
    });
    
    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`   ⚠️  User already exists, updating...`);
        
        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === user.email);
        
        if (existingUser) {
          // Update password
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: user.password,
            email_confirm: true,
          });
          
          // Continue with this user ID
          await createPublicUser(existingUser.id, user, unitMap, roleMap);
        }
      } else {
        console.error(`   ❌ Auth error:`, authError.message);
      }
      continue;
    }
    
    if (authData?.user) {
      console.log(`   ✓ Auth user created: ${authData.user.id}`);
      await createPublicUser(authData.user.id, user, unitMap, roleMap);
    }
  }
}

async function createPublicUser(
  userId: string, 
  user: typeof testUsers[0], 
  unitMap: Map<string, string>,
  roleMap: Map<string, string>
) {
  const unitId = unitMap.get(user.unitCode);
  
  // Step 2: Create public user profile
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      unit_id: unitId,
      is_active: true,
    }, { onConflict: 'id' });
  
  if (profileError) {
    console.error(`   ❌ Profile error:`, profileError.message);
    return;
  }
  console.log(`   ✓ Profile created`);
  
  // Step 3: Assign roles
  for (const roleCode of user.roles) {
    const roleId = roleMap.get(roleCode);
    if (!roleId) {
      console.error(`   ❌ Role not found: ${roleCode}`);
      continue;
    }
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: roleId,
        assigned_by: userId, // Self-assigned for seed data
      }, { onConflict: 'user_id,role_id' });
    
    if (roleError) {
      console.error(`   ❌ Role assignment error:`, roleError.message);
    } else {
      console.log(`   ✓ Role assigned: ${roleCode}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Auth User Seed Script');
  console.log('================================');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    // Test connection
    const { error: testError } = await supabase.from('units').select('count').limit(1);
    if (testError) {
      console.error('❌ Cannot connect to database:', testError.message);
      console.error('   Make sure migration has been run first!');
      process.exit(1);
    }
    
    // Seed data
    await seedUnits();
    await seedRoles();
    await seedUsers();
    
    console.log('\n================================');
    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('┌─────────────────────────┬──────────────┬──────────────┐');
    console.log('│ Email                   │ Password     │ Roles        │');
    console.log('├─────────────────────────┼──────────────┼──────────────┤');
    for (const user of testUsers) {
      const email = user.email.padEnd(23);
      const password = user.password.padEnd(12);
      const roles = user.roles.join(', ').padEnd(12);
      console.log(`│ ${email} │ ${password} │ ${roles} │`);
    }
    console.log('└─────────────────────────┴──────────────┴──────────────┘');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();
