import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

/**
 * GET /api/admin/data
 * Fetch all admin data (users, roles, units, categories)
 * Admin only
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRoles();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userForPermission = toUserForPermission(user);
    if (!isAdmin(userForPermission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use admin client to bypass RLS and fetch all users
    const supabase = await createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Fetch all data in parallel
    const [usersRes, rolesRes, unitsRes, categoriesRes] = await Promise.all([
      // Users with their roles and units
      supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          phone,
          is_active,
          created_at,
          unit:units(id, name),
          user_roles(
            role:roles(id, name, display_name)
          )
        `)
        .order("created_at", { ascending: false }),

      // All roles
      supabase
        .from("roles")
        .select("id, name, display_name")
        .order("name"),

      // All units
      supabase
        .from("units")
        .select("id, name, code")
        .order("name"),

      // All categories
      supabase
        .from("categories")
        .select(`
          id,
          name,
          code,
          description,
          parent_id,
          is_active,
          sort_order,
          unit:units(id, name)
        `)
        .order("sort_order"),
    ]);

    // Transform users data to flatten roles
    const users = (usersRes.data || []).map((u: any) => ({
      ...u,
      roles: u.user_roles?.map((ur: any) => ur.role).filter(Boolean) || [],
    }));

    return NextResponse.json({
      users,
      roles: rolesRes.data || [],
      units: unitsRes.data || [],
      categories: categoriesRes.data || [],
    });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
