import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, serviceRoleKey!);

async function main() {
  const email = 'baonguyen@eiu.edu.vn';
  const fullName = 'Nguyễn Báo Nguyên';
  const phone = '0901000010';
  const unitCode = 'PHONG-TCHC';
  const roleName = 'admin';

  // 1. Lấy user id từ auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) throw authError;
  const user = authUsers.users.find(u => u.email === email);
  if (!user) throw new Error('User not found in auth.users');

  // 2. Lấy unit id
  const { data: units } = await supabase.from('units').select('id,code');
  const unit = units?.find(u => u.code === unitCode);
  if (!unit) throw new Error('Unit not found');

  // 3. Thêm profile vào public.users
  await supabase.from('users').upsert({
    id: user.id,
    email,
    full_name: fullName,
    phone,
    unit_id: unit.id,
    is_active: true,
  }, { onConflict: 'id' });

  // 4. Lấy role id
  const { data: roles } = await supabase.from('roles').select('id,name');
  const role = roles?.find(r => r.name === roleName);
  if (!role) throw new Error('Role not found');

  // 5. Gán role cho user
  await supabase.from('user_roles').upsert({
    user_id: user.id,
    role_id: role.id,
    assigned_by: user.id,
  }, { onConflict: 'user_id,role_id' });

  console.log('✅ Đã thêm profile và role admin cho', email);
}

main().catch(e => console.error('❌ Lỗi:', e.message));
