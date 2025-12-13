import { createClient } from "@/lib/supabase/server";
import { RoleManagement } from "@/components/admin/role-management";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <div className="text-red-600">Lỗi kết nối database</div>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role
  const { data: userRole } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRole?.role !== "admin") redirect("/unauthorized");

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
