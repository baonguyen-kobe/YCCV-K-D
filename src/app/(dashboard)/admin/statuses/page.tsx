import { createClient } from "@/lib/supabase/server";
import { StatusManagement } from "@/components/admin/status-management";
import { redirect } from "next/navigation";

export default async function StatusesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <div className="text-red-600">Lỗi kết nối database</div>;
  }

  const { data: user } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check admin role
  const { data: userRole } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  if (userRole?.role !== "admin") redirect("/unauthorized");

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
