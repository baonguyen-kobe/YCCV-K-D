import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TARGET_USER_ID = "00200000-2000-0200-0001-000000000001";

async function main() {
  console.log(`🔧 Fixing user ${TARGET_USER_ID}...`);

  // 1. Check Auth User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.admin.getUserById(TARGET_USER_ID);

  if (authError || !user) {
    console.log("⚠️ User not found in Auth. Creating...");
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: "admin@local.host",
      password: "password123",
      email_confirm: true,
      user_metadata: { full_name: "Local Admin" },
    });

    if (createError) {
      console.error("❌ Failed to create auth user:", createError.message);
      // Try to update if exists but get failed?
    } else {
      console.log("✅ Auth user created:", data.user.id);
      // Note: ID might be different if we can't force it via API.
      // But if the user is logged in with TARGET_USER_ID, it MUST exist.
    }
  } else {
    console.log("✅ User exists in Auth.");
  }

  // 2. Ensure Unit
  const { data: unit } = await supabase
    .from("units")
    .select("id")
    .limit(1)
    .single();
  let unitId = unit?.id;

  if (!unitId) {
    console.log("Creating default unit...");
    const { data: newUnit, error: unitError } = await supabase
      .from("units")
      .insert({
        name: "Default Unit",
        code: "DEFAULT",
      })
      .select()
      .single();

    if (unitError) {
      console.error("❌ Failed to create unit:", unitError.message);
      return;
    }
    unitId = newUnit.id;
  }
  console.log("✅ Unit ID:", unitId);

  // 3. Insert Public User
  console.log("Upserting public profile...");
  const { error: profileError } = await supabase.from("users").upsert({
    id: TARGET_USER_ID,
    email: "admin@local.host",
    full_name: "Local Admin",
    unit_id: unitId,
    is_active: true,
  });

  if (profileError) {
    console.error("❌ Error upserting profile:", profileError.message);
    // If FK error, it means auth user really doesn't exist with that ID.
    // In that case, we might need to delete the invalid auth user and recreate,
    // OR just create a new user and ask dev to re-login.
  } else {
    console.log("✅ Profile fixed.");
  }

  // 4. Assign Role
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "admin")
    .single();
  if (role) {
    const { error: roleError } = await supabase.from("user_roles").upsert({
      user_id: TARGET_USER_ID,
      role_id: role.id,
    });
    if (roleError) console.error("❌ Error assigning role:", roleError.message);
    else console.log("✅ Role assigned.");
  } else {
    console.error('❌ Role "admin" not found.');
  }
}

main();
