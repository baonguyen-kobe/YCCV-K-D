import { createClient } from "@/lib/supabase/server";
import { UnitManagement } from "@/components/admin/unit-management";
import { redirect } from "next/navigation";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function UnitsPage() {
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

  // Fetch units
  const { data: units, error } = await supabase
    .from("units")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching units:", error);
    return <div className="text-red-600">Lỗi tải dữ liệu</div>;
  }

  return <UnitManagement units={units || []} />;
}
