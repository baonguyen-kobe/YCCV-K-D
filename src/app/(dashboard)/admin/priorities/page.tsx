import { createClient } from "@/lib/supabase/server";
import { PriorityManagement } from "@/components/admin/priority-management";
import { redirect } from "next/navigation";

export default async function PrioritiesPage() {
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
