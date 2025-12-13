import { createClient } from "@/lib/supabase/server";
import { RoleManagement } from "@/components/admin/role-management";
import { redirect } from "next/navigation";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function RolesPage() {
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);

  // Only admin can access
  if (!isAdmin(userForPermission)) {
    redirect("/unauthorized");
  }

  const supabase = await createClient();
  if (!supabase) {
    return <div className="text-red-600">Lỗi kết nối database</div>;
  }

  // Fetch roles
  const { data: roles, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching roles:", error);
    return <div className="text-red-600">Lỗi tải dữ liệu</div>;
  }

  return <RoleManagement roles={roles || []} />;
}
