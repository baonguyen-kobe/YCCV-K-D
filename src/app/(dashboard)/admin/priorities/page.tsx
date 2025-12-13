import { createClient } from "@/lib/supabase/server";
import { PriorityManagement } from "@/components/admin/priority-management";
import { redirect } from "next/navigation";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function PrioritiesPage() {
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

  // Fetch priorities
  const { data: priorities, error } = await supabase
    .from("priorities")
    .select("*")
    .order("level");

  if (error) {
    console.error("Error fetching priorities:", error);
    return <div className="text-red-600">Lỗi tải dữ liệu</div>;
  }

  return <PriorityManagement priorities={priorities || []} />;
}
