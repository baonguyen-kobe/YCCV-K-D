import { createClient } from "@/lib/supabase/server";
import { StatusManagement } from "@/components/admin/status-management";
import { redirect } from "next/navigation";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function StatusesPage() {
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

  // Fetch statuses
  const { data: statuses, error } = await supabase
    .from("request_statuses")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching statuses:", error);
    return <div className="text-red-600">Lỗi tải dữ liệu</div>;
  }

  return <StatusManagement statuses={statuses || []} />;
}
