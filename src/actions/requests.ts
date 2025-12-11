"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles, toUserForPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  canCreateRequest,
  canEditRequest,
  canSubmitRequest,
  canChangeStatus,
  canCancelRequest,
  canComment,
  canCreateInternalComment,
  canAssignRequest,
  REQUEST_STATUS,
  STATE_TRANSITIONS,
} from "@/lib/permissions";
import type { RequestStatus, Priority } from "@/types/database.types";

// ============================================================
// TYPES
// ============================================================

export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface CreateRequestInput {
  reason: string;
  priority: Priority;
  items: {
    item_name: string;
    category_id?: string;
    unit_count?: string;
    quantity: number;
    required_at?: string;
    link_ref?: string;
    notes?: string;
  }[];
}

export interface UpdateRequestInput extends CreateRequestInput {
  id: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getRequestForPermission(supabase: Awaited<ReturnType<typeof createClient>>, requestId: string) {
  const { data: request, error } = await supabase
    .from("requests")
    .select("id, status, created_by, assignee_id, unit_id")
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return null;
  }

  return request;
}

// ============================================================
// CREATE REQUEST
// ============================================================

/**
 * Create a new request (DRAFT status)
 */
export async function createRequest(
  input: CreateRequestInput
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const userForPermission = toUserForPermission(user);

  // Check permission
  if (!canCreateRequest(userForPermission)) {
    return { success: false, error: "Bạn không có quyền tạo yêu cầu" };
  }

  // Validate input
  if (!input.reason?.trim()) {
    return { success: false, error: "Vui lòng nhập lý do yêu cầu" };
  }
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Vui lòng thêm ít nhất một mục yêu cầu" };
  }

  const supabase = await createClient();

  // Get user's unit info for snapshot
  const { data: userProfile } = await supabase
    .from("users")
    .select("unit_id, unit:units(name)")
    .eq("id", user.id)
    .single();

  // Extract unit name from potential array (Supabase FK relation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unitData = userProfile?.unit as any;
  const unitName = Array.isArray(unitData) 
    ? unitData[0]?.name 
    : unitData?.name;

  // Create request
  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      reason: input.reason.trim(),
      priority: input.priority || "NORMAL",
      status: "DRAFT",
      unit_id: userProfile?.unit_id,
      unit_name_snapshot: unitName || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (requestError || !request) {
    console.error("Error creating request:", requestError);
    return { success: false, error: "Không thể tạo yêu cầu. Vui lòng thử lại." };
  }

  // Create request items
  const itemsToInsert = input.items.map((item, index) => ({
    request_id: request.id,
    item_name: item.item_name.trim(),
    category_id: item.category_id || null,
    unit_count: item.unit_count || null,
    quantity: item.quantity || 1,
    required_at: item.required_at || null,
    link_ref: item.link_ref || null,
    notes: item.notes || null,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from("request_items")
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("Error creating request items:", itemsError);
    // Rollback: delete the request
    await supabase.from("requests").delete().eq("id", request.id);
    return { success: false, error: "Không thể tạo chi tiết yêu cầu. Vui lòng thử lại." };
  }

  // Log action
  await supabase.from("request_logs").insert({
    request_id: request.id,
    user_id: user.id,
    action: "created",
    new_status: "DRAFT",
  });

  revalidatePath("/requests");
  revalidatePath("/dashboard");

  return { success: true, data: { id: request.id } };
}

// ============================================================
// UPDATE REQUEST (DRAFT only)
// ============================================================

/**
 * Update request (only when DRAFT)
 */
export async function updateRequest(
  input: UpdateRequestInput
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const supabase = await createClient();
  const request = await getRequestForPermission(supabase, input.id);

  if (!request) {
    return { success: false, error: "Không tìm thấy yêu cầu" };
  }

  const userForPermission = toUserForPermission(user);

  if (!canEditRequest(userForPermission, request)) {
    return { success: false, error: "Bạn không có quyền chỉnh sửa yêu cầu này" };
  }

  // Validate input
  if (!input.reason?.trim()) {
    return { success: false, error: "Vui lòng nhập lý do yêu cầu" };
  }
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Vui lòng thêm ít nhất một mục yêu cầu" };
  }

  // Update request
  const { error: updateError } = await supabase
    .from("requests")
    .update({
      reason: input.reason.trim(),
      priority: input.priority,
    })
    .eq("id", input.id);

  if (updateError) {
    console.error("Error updating request:", updateError);
    return { success: false, error: "Không thể cập nhật yêu cầu. Vui lòng thử lại." };
  }

  // Delete existing items and insert new ones
  await supabase.from("request_items").delete().eq("request_id", input.id);

  const itemsToInsert = input.items.map((item, index) => ({
    request_id: input.id,
    item_name: item.item_name.trim(),
    category_id: item.category_id || null,
    unit_count: item.unit_count || null,
    quantity: item.quantity || 1,
    required_at: item.required_at || null,
    link_ref: item.link_ref || null,
    notes: item.notes || null,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from("request_items")
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("Error updating request items:", itemsError);
    return { success: false, error: "Không thể cập nhật chi tiết yêu cầu" };
  }

  revalidatePath(`/requests/${input.id}`);
  revalidatePath("/requests");

  return { success: true };
}

// ============================================================
// SUBMIT REQUEST (DRAFT -> NEW)
// ============================================================

/**
 * Submit request (DRAFT -> NEW)
 */
export async function submitRequest(
  requestId: string
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const supabase = await createClient();
  const request = await getRequestForPermission(supabase, requestId);

  if (!request) {
    return { success: false, error: "Không tìm thấy yêu cầu" };
  }

  const userForPermission = toUserForPermission(user);

  if (!canSubmitRequest(userForPermission, request)) {
    return { success: false, error: "Bạn không có quyền gửi yêu cầu này" };
  }

  if (request.status !== REQUEST_STATUS.DRAFT) {
    return { success: false, error: "Chỉ có thể gửi yêu cầu ở trạng thái Nháp" };
  }

  const { error } = await supabase
    .from("requests")
    .update({ status: "NEW" })
    .eq("id", requestId);

  if (error) {
    console.error("Error submitting request:", error);
    return { success: false, error: "Không thể gửi yêu cầu. Vui lòng thử lại." };
  }

  // Status change is logged automatically by trigger

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");

  return { success: true };
}

// ============================================================
// ASSIGN REQUEST
// ============================================================

/**
 * Assign request to staff (NEW -> ASSIGNED)
 */
export async function assignRequest(
  requestId: string,
  assigneeId: string
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const supabase = await createClient();
  const request = await getRequestForPermission(supabase, requestId);

  if (!request) {
    return { success: false, error: "Không tìm thấy yêu cầu" };
  }

  const userForPermission = toUserForPermission(user);

  if (!canAssignRequest(userForPermission, request)) {
    return { success: false, error: "Bạn không có quyền phân công yêu cầu này" };
  }

  // Verify assignee is a staff member
  const { data: assignee } = await supabase
    .from("users")
    .select("id, user_roles(role:roles(name))")
    .eq("id", assigneeId)
    .single();

  if (!assignee) {
    return { success: false, error: "Không tìm thấy người được phân công" };
  }

  const { error } = await supabase
    .from("requests")
    .update({
      status: "ASSIGNED",
      assignee_id: assigneeId,
      assigned_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    console.error("Error assigning request:", error);
    return { success: false, error: "Không thể phân công yêu cầu. Vui lòng thử lại." };
  }

  // Log assignment
  await supabase.from("request_logs").insert({
    request_id: requestId,
    user_id: user.id,
    action: "assigned",
    old_status: "NEW",
    new_status: "ASSIGNED",
    meta_data: { assignee_id: assigneeId },
  });

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");

  return { success: true };
}

// ============================================================
// UPDATE STATUS
// ============================================================

/**
 * Update request status (following State Machine)
 */
export async function updateRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  note?: string
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const supabase = await createClient();
  const request = await getRequestForPermission(supabase, requestId);

  if (!request) {
    return { success: false, error: "Không tìm thấy yêu cầu" };
  }

  const userForPermission = toUserForPermission(user);
  const oldStatus = request.status as RequestStatus;

  if (!canChangeStatus(userForPermission, request, oldStatus, newStatus)) {
    return { success: false, error: "Bạn không có quyền thay đổi trạng thái này" };
  }

  // Validate transition
  const validTransitions = STATE_TRANSITIONS[oldStatus];
  if (!validTransitions.includes(newStatus) && userForPermission.roles.includes("admin") === false) {
    return { success: false, error: `Không thể chuyển từ ${oldStatus} sang ${newStatus}` };
  }

  // Prepare update data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = { status: newStatus };

  if (newStatus === "DONE") {
    updateData.completed_at = new Date().toISOString();
    updateData.completion_note = note || null;
  } else if (newStatus === "CANCELLED") {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancelled_by = user.id;
    updateData.cancel_reason = note || null;
  }

  const { error } = await supabase
    .from("requests")
    .update(updateData)
    .eq("id", requestId);

  if (error) {
    console.error("Error updating status:", error);
    return { success: false, error: "Không thể cập nhật trạng thái. Vui lòng thử lại." };
  }

  // Status change is logged automatically by trigger

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");

  return { success: true };
}

// ============================================================
// CANCEL REQUEST
// ============================================================

/**
 * Cancel request
 */
export async function cancelRequest(
  requestId: string,
  reason?: string
): Promise<ActionResult> {
  return updateRequestStatus(requestId, "CANCELLED", reason);
}

// ============================================================
// ADD COMMENT
// ============================================================

/**
 * Add comment to request
 */
export async function addComment(
  requestId: string,
  content: string,
  isInternal: boolean = false
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  if (!content?.trim()) {
    return { success: false, error: "Vui lòng nhập nội dung bình luận" };
  }

  if (content.trim().length > 1000) {
    return { success: false, error: "Bình luận không được vượt quá 1000 ký tự" };
  }

  const supabase = await createClient();
  const request = await getRequestForPermission(supabase, requestId);

  if (!request) {
    return { success: false, error: "Không tìm thấy yêu cầu" };
  }

  const userForPermission = toUserForPermission(user);

  if (!canComment(userForPermission, request)) {
    return { success: false, error: "Bạn không có quyền bình luận yêu cầu này" };
  }

  // Check internal comment permission
  if (isInternal && !canCreateInternalComment(userForPermission)) {
    return { success: false, error: "Bạn không có quyền tạo bình luận nội bộ" };
  }

  const { data: comment, error } = await supabase
    .from("request_comments")
    .insert({
      request_id: requestId,
      user_id: user.id,
      content: content.trim(),
      is_internal: isInternal,
    })
    .select("id")
    .single();

  if (error || !comment) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Không thể thêm bình luận. Vui lòng thử lại." };
  }

  // Log action
  await supabase.from("request_logs").insert({
    request_id: requestId,
    user_id: user.id,
    action: "comment_added",
    meta_data: { comment_id: comment.id, is_internal: isInternal },
  });

  revalidatePath(`/requests/${requestId}`);

  return { success: true, data: { id: comment.id } };
}

// ============================================================
// GET STAFF LIST FOR ASSIGNMENT
// ============================================================

/**
 * Get list of staff members for assignment dropdown
 */
export async function getStaffList(): Promise<ActionResult<{ id: string; name: string; email: string }[]>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();

  // Get staff role ID
  const { data: staffRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "staff")
    .single();

  if (!staffRole) {
    return { success: false, error: "Không tìm thấy vai trò staff" };
  }

  // Get users with staff role
  const { data: staffUsers, error } = await supabase
    .from("user_roles")
    .select(`
      user:users (
        id,
        full_name,
        email
      )
    `)
    .eq("role_id", staffRole.id);

  if (error) {
    console.error("Error fetching staff:", error);
    return { success: false, error: "Không thể tải danh sách nhân viên" };
  }

  const staff = staffUsers
    ?.map((ur) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = ur.user as any;
      const u = Array.isArray(userData) ? userData[0] : userData;
      return u ? { id: u.id, name: u.full_name || u.email, email: u.email } : null;
    })
    .filter(Boolean) as { id: string; name: string; email: string }[];

  return { success: true, data: staff || [] };
}
