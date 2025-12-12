import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { canCreateRequest } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { RequestForm } from "@/components/requests/request-form";

/**
 * Create Request Page
 * PRD Section 3.2: Tạo phiếu yêu cầu
 */
export default async function CreateRequestPage() {
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);

  // Check permission
  if (!canCreateRequest(userForPermission)) {
    redirect("/unauthorized");
  }

  // Fetch categories for dropdown
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Failed to create Supabase client");
  }
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, code")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RequestForm categories={categories || []} mode="create" />
    </div>
  );
}
