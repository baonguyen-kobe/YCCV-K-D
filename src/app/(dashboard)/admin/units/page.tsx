import { createClient } from "@/lib/supabase/server";
import { UnitManagement } from "@/components/admin/unit-management";
import { redirect } from "next/navigation";

export default async function UnitsPage() {
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
