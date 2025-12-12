import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/admin/user-management";

/**
 * Admin Users Page
 * PRD Section 2.3: Quản lý User (Admin only)
 */
export default async function AdminUsersPage() {
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);

  // Only admin can access
  if (!isAdmin(userForPermission)) {
    redirect("/unauthorized");
  }

  const supabase = await createClient();

  // Fetch users with their roles and units
  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone,
      is_active,
      created_at,
      unit:units (id, name),
      user_roles (
        role:roles (id, name, display_name)
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch all roles for assignment
  const { data: roles } = await supabase
    .from("roles")
    .select("id, name, display_name")
    .order("name");

  // Fetch all units for assignment
  const { data: units } = await supabase
    .from("units")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  // Transform users data
  const transformedUsers = (users || []).map((u) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unitData = u.unit as any;
    const unit = Array.isArray(unitData) ? unitData[0] : unitData;
    
    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      is_active: u.is_active,
      created_at: u.created_at,
      unit: unit ? { id: unit.id, name: unit.name } : null,
      roles: (u.user_roles || []).map((ur: { role: { id: string; name: string; display_name: string } | { id: string; name: string; display_name: string }[] | null }) => {
        const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;
        return role ? { id: role.id, name: role.name, display_name: role.display_name } : null;
      }).filter((r): r is { id: string; name: string; display_name: string } => r !== null),
    };
  });

  return (
    <div className="space-y-6">
      <UserManagement
        users={transformedUsers}
        roles={roles || []}
        units={units || []}
      />
    </div>
  );
}
