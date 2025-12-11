"use server";

/**
 * Admin Server Actions
 * Handle user management, categories, system config
 */

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles, toUserForPermission } from "@/lib/auth";
import { isAdmin, isManager, hasAnyRole, ROLES } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================
// USER MANAGEMENT (Admin only)
// ============================================================

export interface CreateUserInput {
  email: string;
  full_name: string;
  phone?: string;
  unit_id?: string;
  roles: string[]; // role IDs
}

/**
 * Create new user (Admin only)
 */
export async function createUser(input: CreateUserInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const userForPermission = toUserForPermission(user);
  if (!isAdmin(userForPermission)) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  if (!input.email?.trim() || !input.full_name?.trim()) {
    return { success: false, error: "Email và họ tên là bắt buộc" };
  }

  const supabase = await createClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", input.email.trim().toLowerCase())
    .single();

  if (existing) {
    return { success: false, error: "Email này đã tồn tại trong hệ thống" };
  }

  // Create user in users table (not in auth - admin creates profile only)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      email: input.email.trim().toLowerCase(),
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || null,
      unit_id: input.unit_id || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (userError || !newUser) {
    console.error("Error creating user:", userError);
    return { success: false, error: "Không thể tạo người dùng" };
  }

  // Assign roles
  if (input.roles && input.roles.length > 0) {
    const roleInserts = input.roles.map((roleId) => ({
      user_id: newUser.id,
      role_id: roleId,
      assigned_by: user.id,
    }));

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert(roleInserts);

    if (roleError) {
      console.error("Error assigning roles:", roleError);
      // User created but roles failed - continue
    }
  }

  revalidatePath("/admin/users");
  return { success: true, data: { id: newUser.id } };
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  phone?: string;
  unit_id?: string | null;
  is_active?: boolean;
  roles?: string[]; // role IDs
}

/**
 * Update user profile/roles (Admin only)
 */
export async function updateUser(input: UpdateUserInput): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const userForPermission = toUserForPermission(user);
  if (!isAdmin(userForPermission)) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  const supabase = await createClient();

  // Update user profile
  const updateData: Record<string, unknown> = {};
  if (input.full_name !== undefined) updateData.full_name = input.full_name.trim();
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;
  if (input.unit_id !== undefined) updateData.unit_id = input.unit_id;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", input.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return { success: false, error: "Không thể cập nhật người dùng" };
    }
  }

  // Update roles if provided
  if (input.roles !== undefined) {
    // Delete existing roles
    await supabase.from("user_roles").delete().eq("user_id", input.id);

    // Insert new roles
    if (input.roles.length > 0) {
      const roleInserts = input.roles.map((roleId) => ({
        user_id: input.id,
        role_id: roleId,
        assigned_by: user.id,
      }));

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert(roleInserts);

      if (roleError) {
        console.error("Error updating roles:", roleError);
      }
    }
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Toggle user active status (Admin only)
 */
export async function toggleUserStatus(userId: string): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const userForPermission = toUserForPermission(user);
  if (!isAdmin(userForPermission)) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  // Prevent disabling yourself
  if (userId === user.id) {
    return { success: false, error: "Bạn không thể vô hiệu hóa chính mình" };
  }

  const supabase = await createClient();

  // Get current status
  const { data: targetUser } = await supabase
    .from("users")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (!targetUser) {
    return { success: false, error: "Không tìm thấy người dùng" };
  }

  // Toggle status
  const { error } = await supabase
    .from("users")
    .update({ is_active: !targetUser.is_active })
    .eq("id", userId);

  if (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: "Không thể cập nhật trạng thái" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================
// CATEGORY MANAGEMENT (Admin/Manager)
// ============================================================

export interface UpsertCategoryInput {
  id?: string; // If provided, update; otherwise create
  name: string;
  code?: string;
  description?: string;
  parent_id?: string | null;
  unit_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Create/Update category (Admin/Manager)
 */
export async function upsertCategory(input: UpsertCategoryInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const userForPermission = toUserForPermission(user);
  if (!hasAnyRole(userForPermission, [ROLES.ADMIN, ROLES.MANAGER])) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  if (!input.name?.trim()) {
    return { success: false, error: "Tên danh mục là bắt buộc" };
  }

  const supabase = await createClient();

  const categoryData = {
    name: input.name.trim(),
    code: input.code?.trim() || null,
    description: input.description?.trim() || null,
    parent_id: input.parent_id || null,
    unit_id: input.unit_id || null,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };

  if (input.id) {
    // Update existing
    const { error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", input.id);

    if (error) {
      console.error("Error updating category:", error);
      return { success: false, error: "Không thể cập nhật danh mục" };
    }

    revalidatePath("/admin/categories");
    return { success: true, data: { id: input.id } };
  } else {
    // Create new
    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert(categoryData)
      .select("id")
      .single();

    if (error || !newCategory) {
      console.error("Error creating category:", error);
      return { success: false, error: "Không thể tạo danh mục" };
    }

    revalidatePath("/admin/categories");
    return { success: true, data: { id: newCategory.id } };
  }
}

/**
 * Delete category (Admin only)
 */
export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const userForPermission = toUserForPermission(user);
  if (!isAdmin(userForPermission)) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  const supabase = await createClient();

  // Check if category is being used
  const { count } = await supabase
    .from("request_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return { success: false, error: "Không thể xóa danh mục đang được sử dụng" };
  }

  // Check for child categories
  const { count: childCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", categoryId);

  if (childCount && childCount > 0) {
    return { success: false, error: "Không thể xóa danh mục có danh mục con" };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Không thể xóa danh mục" };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

// ============================================================
// PROFILE (Self-update)
// ============================================================

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
}

/**
 * Update own profile
 */
export async function updateProfile(input: UpdateProfileInput): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (input.full_name !== undefined) updateData.full_name = input.full_name.trim();
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;

  if (Object.keys(updateData).length === 0) {
    return { success: true }; // Nothing to update
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Không thể cập nhật hồ sơ" };
  }

  revalidatePath("/profile");
  return { success: true };
}
