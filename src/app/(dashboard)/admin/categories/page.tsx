import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { hasAnyRole, ROLES } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { CategoryManagement } from "@/components/admin/category-management";

/**
 * Admin Categories Page
 * PRD Section 2.3: Quản lý Danh mục (Admin/Manager)
 */
export default async function AdminCategoriesPage() {
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);

  // Admin or Manager can access
  if (!hasAnyRole(userForPermission, [ROLES.ADMIN, ROLES.MANAGER])) {
    redirect("/unauthorized");
  }

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Failed to create Supabase client");
  }

  // Fetch categories with parent info
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      code,
      description,
      parent_id,
      is_active,
      sort_order,
      unit:units (id, name)
    `)
    .order("sort_order")
    .order("name");

  // Fetch units for dropdown
  const { data: units } = await supabase
    .from("units")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  // Transform categories
  const transformedCategories = (categories || []).map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unitData = c.unit as any;
    const unit = Array.isArray(unitData) ? unitData[0] : unitData;
    
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      parent_id: c.parent_id,
      is_active: c.is_active,
      sort_order: c.sort_order,
      unit: unit ? { id: unit.id, name: unit.name } : null,
    };
  });

  return (
    <div className="space-y-6">
      <CategoryManagement
        categories={transformedCategories}
        units={units || []}
      />
    </div>
  );
}
