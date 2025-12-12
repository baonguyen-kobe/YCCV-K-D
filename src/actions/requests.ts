"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithRoles, toUserForPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  canCreateRequest,
  canEditRequest,
  canSubmitRequest,
  canChangeStatus,
  canComment,
  canCreateInternalComment,
  canAssignRequest,
  isAdmin,
  REQUEST_STATUS,
  STATE_TRANSITIONS,
} from "@/lib/permissions";
import { checkRateLimit, formatRateLimitError } from "@/lib/rate-limiting";
import { 
  RATE_LIMIT_REQUESTS_PER_MINUTE, 
  MAX_FILE_SIZE_BYTES, 
  ALLOWED_FILE_TYPES,
  MAX_ATTACHMENTS_PER_REQUEST,
} from "@/lib/constants";
import {
  validateInput,
  createRequestSchema,
  updateRequestSchema,
  assignRequestSchema,
  changeStatusSchema,
  addCommentSchema,
} from "@/lib/validations";
import type { RequestStatus, Priority } from "@/types/database.types";

// ============================================================
// TYPES
// ============================================================

export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
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
  version?: number; // For optimistic locking
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getRequestForPermission(supabase: Awaited<ReturnType<typeof createClient>>, requestId: string) {
  const { data: request, error } = await supabase
    .from("requests")
    .select("id, status, created_by, assignee_id, unit_id, version")
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return null;
  }

  return request;
}

/**
 * Call update_request_with_locking RPC for optimistic locking
 */
async function updateRequestWithLocking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    request_id: string;
    current_version: number;
    new_status?: RequestStatus;
    assignee_id?: string;
    completion_note?: string;
    cancel_reason?: string;
    reason?: string;
    priority?: Priority;
  }
): Promise<{ success: boolean; newVersion?: number; error?: string }> {
  const { data, error } = await supabase.rpc("update_request_with_locking", {
    p_request_id: params.request_id,
    p_current_version: params.current_version,
    p_new_status: params.new_status || null,
    p_assignee_id: params.assignee_id || null,
    p_completion_note: params.completion_note || null,
    p_cancel_reason: params.cancel_reason || null,
    p_reason: params.reason || null,
    p_priority: params.priority || null,
  });

  if (error) {
    console.error("Error calling update_request_with_locking:", error);
    return { success: false, error: "Không thể cập nhật yêu cầu. Vui lòng thử lại." };
  }

  const result = data?.[0];
  if (!result?.success) {
    return { success: false, error: result?.error_message || "Dữ liệu đã bị thay đổi bởi người khác" };
  }

  return { success: true, newVersion: result.new_version };
}
/**
 * Call create_request_atomic RPC for atomic creation
 */
async function createRequestAtomic(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    reason: string;
    priority: Priority;
    unit_id?: string;
    unit_name_snapshot?: string;
    created_by: string;
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
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const { data, error } = await supabase.rpc("create_request_atomic", {
    p_reason: params.reason,
    p_priority: params.priority,
    p_unit_id: params.unit_id || null,
    p_unit_name_snapshot: params.unit_name_snapshot || null,
    p_created_by: params.created_by,
    p_items: JSON.stringify(params.items),
  });

  if (error) {
    console.error("Error calling create_request_atomic:", error);
    return { success: false, error: "Không thể tạo yêu cầu. Vui lòng thử lại." };
  }

  const result = data?.[0];
  if (!result?.success) {
    return { success: false, error: result?.error_message || "Không thể tạo yêu cầu" };
  }

  return { success: true, requestId: result.request_id };
}

/**
 * Call update_request_atomic RPC for atomic update
 */
async function updateRequestAtomic(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    request_id: string;
    current_version: number;
    reason?: string;
    priority?: Priority;
    items?: {
      item_name: string;
      category_id?: string;
      unit_count?: string;
      quantity: number;
      required_at?: string;
      link_ref?: string;
      notes?: string;
    }[];
  }
): Promise<{ success: boolean; newVersion?: number; error?: string }> {
  const { data, error } = await supabase.rpc("update_request_atomic", {
    p_request_id: params.request_id,
    p_current_version: params.current_version,
    p_reason: params.reason || null,
    p_priority: params.priority || null,
    p_items: params.items ? JSON.stringify(params.items) : null,
  });

  if (error) {
    console.error("Error calling update_request_atomic:", error);
    return { success: false, error: "Không thể cập nhật yêu cầu. Vui lòng thử lại." };
  }

  const result = data?.[0];
  if (!result?.success) {
    return { success: false, error: result?.error_message || "Dữ liệu đã bị thay đổi bởi người khác" };
  }

  return { success: true, newVersion: result.new_version };
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

  // Rate limiting check (per PRD Section 3.2)
  const rateLimitResult = await checkRateLimit(user.id, "create_request", RATE_LIMIT_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: formatRateLimitError(rateLimitResult.resetAt),
    };
  }

  // Validate input using Zod
  const validation = validateInput(createRequestSchema, input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    };
  }

  const validatedInput = validation.data!;
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
      reason: validatedInput.reason.trim(),
      priority: validatedInput.priority || "NORMAL",
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
  const itemsToInsert = validatedInput.items.map((item, index) => ({
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
 * Update request (only when DRAFT) - with optimistic locking
 */
export async function updateRequest(
  input: UpdateRequestInput
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(user.id, "update_request", RATE_LIMIT_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: formatRateLimitError(rateLimitResult.resetAt),
    };
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

  // Validate input using Zod
  const validation = validateInput(createRequestSchema, {
    reason: input.reason,
    priority: input.priority,
    items: input.items,
  });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    };
  }

  const validatedInput = validation.data!;

  // Use optimistic locking if version provided
  const currentVersion = input.version ?? request.version ?? 1;
  
  // Update request with optimistic locking
  const lockResult = await updateRequestWithLocking(supabase, {
    request_id: input.id,
    current_version: currentVersion,
    reason: validatedInput.reason.trim(),
    priority: validatedInput.priority,
  });

  if (!lockResult.success) {
    return { success: false, error: lockResult.error };
  }

  // Delete existing items and insert new ones
  await supabase.from("request_items").delete().eq("request_id", input.id);

  const itemsToInsert = validatedInput.items.map((item, index) => ({
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
 * Submit request (DRAFT -> NEW) - with optimistic locking
 */
export async function submitRequest(
  requestId: string,
  version?: number
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  // Rate limiting check (per PRD Section 3.2)
  const rateLimitResult = await checkRateLimit(user.id, "submit_request", RATE_LIMIT_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: formatRateLimitError(rateLimitResult.resetAt),
    };
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

  // Use optimistic locking
  const currentVersion = version ?? request.version ?? 1;

  const lockResult = await updateRequestWithLocking(supabase, {
    request_id: requestId,
    current_version: currentVersion,
    new_status: "NEW",
  });

  if (!lockResult.success) {
    return { success: false, error: lockResult.error };
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
 * Assign request to staff (NEW -> ASSIGNED) - with optimistic locking
 */
export async function assignRequest(
  requestId: string,
  assigneeId: string,
  version?: number
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  // Validate input using Zod
  const validation = validateInput(assignRequestSchema, {
    request_id: requestId,
    assignee_id: assigneeId,
  });
  if (!validation.success) {
    return { success: false, error: validation.error };
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

  // Use optimistic locking
  const currentVersion = version ?? request.version ?? 1;

  const lockResult = await updateRequestWithLocking(supabase, {
    request_id: requestId,
    current_version: currentVersion,
    new_status: "ASSIGNED",
    assignee_id: assigneeId,
  });

  if (!lockResult.success) {
    return { success: false, error: lockResult.error };
  }

  // Update assigned_at separately (not in RPC)
  await supabase
    .from("requests")
    .update({ assigned_at: new Date().toISOString() })
    .eq("id", requestId);

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
 * Update request status (following State Machine) - with optimistic locking
 */
export async function updateRequestStatus(
  requestId: string,
  newStatus: RequestStatus,
  note?: string,
  version?: number
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(user.id, "update_status", RATE_LIMIT_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: formatRateLimitError(rateLimitResult.resetAt),
    };
  }

  // Validate input using Zod
  const validation = validateInput(changeStatusSchema, {
    request_id: requestId,
    new_status: newStatus,
    note: note,
    completion_note: newStatus === "DONE" ? note : undefined,
    cancel_reason: newStatus === "CANCELLED" ? note : undefined,
  });
  if (!validation.success) {
    return { success: false, error: validation.error };
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

  // Use optimistic locking
  const currentVersion = version ?? request.version ?? 1;

  const lockResult = await updateRequestWithLocking(supabase, {
    request_id: requestId,
    current_version: currentVersion,
    new_status: newStatus,
    completion_note: newStatus === "DONE" ? note : undefined,
    cancel_reason: newStatus === "CANCELLED" ? note : undefined,
  });

  if (!lockResult.success) {
    return { success: false, error: lockResult.error };
  }

  // Update timestamps separately (not in RPC)
  if (newStatus === "DONE") {
    await supabase
      .from("requests")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", requestId);
  } else if (newStatus === "CANCELLED") {
    await supabase
      .from("requests")
      .update({
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
      })
      .eq("id", requestId);
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
  reason?: string,
  version?: number
): Promise<ActionResult> {
  return updateRequestStatus(requestId, "CANCELLED", reason, version);
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

  // Rate limiting check (per PRD Section 3.2)
  const rateLimitResult = await checkRateLimit(user.id, "add_comment", RATE_LIMIT_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: formatRateLimitError(rateLimitResult.resetAt),
    };
  }

  // Validate input using Zod
  const validation = validateInput(addCommentSchema, {
    request_id: requestId,
    content: content,
    is_internal: isInternal,
  });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    };
  }

  const validatedInput = validation.data!;
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
  if (validatedInput.is_internal && !canCreateInternalComment(userForPermission)) {
    return { success: false, error: "Bạn không có quyền tạo bình luận nội bộ" };
  }

  const { data: comment, error } = await supabase
    .from("request_comments")
    .insert({
      request_id: requestId,
      user_id: user.id,
      content: validatedInput.content.trim(),
      is_internal: validatedInput.is_internal,
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
    meta_data: { comment_id: comment.id, is_internal: validatedInput.is_internal },
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

// ============================================================
// FILE ATTACHMENT ACTIONS
// ============================================================

interface AttachmentData {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
}

/**
 * Upload attachment file to Supabase Storage
 */
export async function uploadAttachment(
  formData: FormData
): Promise<ActionResult<AttachmentData>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để upload file" };
  }

  const file = formData.get("file") as File | null;
  const requestId = formData.get("requestId") as string | null;

  if (!file) {
    return { success: false, error: "Không tìm thấy file" };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: `File quá lớn. Tối đa ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { success: false, error: "Loại file không được hỗ trợ" };
  }

  const supabase = await createClient();

  // Check attachment count if request specified
  if (requestId) {
    const { count } = await supabase
      .from("attachments")
      .select("*", { count: "exact", head: true })
      .eq("request_id", requestId);

    if (count && count >= MAX_ATTACHMENTS_PER_REQUEST) {
      return { success: false, error: `Tối đa ${MAX_ATTACHMENTS_PER_REQUEST} file đính kèm` };
    }
  }

  // Generate unique filename
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${timestamp}-${safeFileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: "Không thể upload file. Vui lòng thử lại." };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  // Determine file type
  let fileType: "image" | "document" | "file" = "file";
  if (file.type.startsWith("image/")) {
    fileType = "image";
  } else if (file.type.includes("pdf") || file.type.includes("word") || file.type.includes("excel") || file.type.includes("sheet")) {
    fileType = "document";
  }

  // Create attachment record
  const { data: attachment, error: dbError } = await supabase
    .from("attachments")
    .insert({
      request_id: requestId || null,
      file_name: file.name,
      file_type: fileType,
      file_size: file.size,
      file_url: filePath, // Store path, not full URL
      uploaded_by: user.id,
    })
    .select("id, file_name, file_type, file_size, file_url")
    .single();

  if (dbError || !attachment) {
    console.error("DB error:", dbError);
    // Cleanup uploaded file
    await supabase.storage.from("attachments").remove([filePath]);
    return { success: false, error: "Không thể lưu thông tin file" };
  }

  return {
    success: true,
    data: {
      id: attachment.id,
      file_name: attachment.file_name,
      file_type: attachment.file_type,
      file_size: attachment.file_size,
      file_url: urlData.publicUrl,
    },
  };
}

/**
 * Delete attachment
 */
export async function deleteAttachment(
  attachmentId: string
): Promise<ActionResult> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();

  // Get attachment
  const { data: attachment } = await supabase
    .from("attachments")
    .select("id, file_url, uploaded_by, request_id")
    .eq("id", attachmentId)
    .single();

  if (!attachment) {
    return { success: false, error: "Không tìm thấy file" };
  }

  const userForPermission = toUserForPermission(user);

  // Check permission: owner or admin
  if (attachment.uploaded_by !== user.id && !isAdmin(userForPermission)) {
    return { success: false, error: "Bạn không có quyền xoá file này" };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("attachments")
    .remove([attachment.file_url]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (dbError) {
    console.error("DB delete error:", dbError);
    return { success: false, error: "Không thể xoá file" };
  }

  if (attachment.request_id) {
    revalidatePath(`/requests/${attachment.request_id}`);
  }

  return { success: true };
}

/**
 * Get attachments for a request
 */
export async function getAttachments(
  requestId: string
): Promise<ActionResult<AttachmentData[]>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();

  const { data: attachments, error } = await supabase
    .from("attachments")
    .select("id, file_name, file_type, file_size, file_url")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching attachments:", error);
    return { success: false, error: "Không thể tải danh sách file" };
  }

  // Generate signed URLs for each attachment
  const attachmentsWithUrls = await Promise.all(
    (attachments || []).map(async (att) => {
      const { data } = await supabase.storage
        .from("attachments")
        .createSignedUrl(att.file_url, 3600); // 1 hour expiry

      return {
        id: att.id,
        file_name: att.file_name,
        file_type: att.file_type,
        file_size: att.file_size,
        file_url: data?.signedUrl || "",
      };
    })
  );

  return { success: true, data: attachmentsWithUrls };
}

// ============================================================
// SEARCH REQUESTS (Phase 3)
// ============================================================

export interface SearchRequestsInput {
  query: string;
  status?: RequestStatus | "all";
  priority?: Priority | "all";
  page?: number;
  pageSize?: number;
}

export interface SearchRequestResult {
  id: string;
  request_number: number;
  reason: string;
  priority: Priority;
  status: RequestStatus;
  created_at: string;
  creator_name: string | null;
  creator_email: string | null;
  assignee_name: string | null;
  matched_items: string[] | null;
}

/**
 * Search requests with full-text search across reason and items
 * Uses search_requests RPC function for better performance
 */
export async function searchRequests(
  input: SearchRequestsInput
): Promise<ActionResult<{ requests: SearchRequestResult[]; totalCount: number }>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();
  const userForPermission = toUserForPermission(user);
  
  const isAdminUser = isAdmin(userForPermission);
  const isManagerUser = userForPermission.roles.includes("manager");
  const isStaffUser = userForPermission.roles.includes("staff");

  const status = input.status && input.status !== "all" ? input.status : null;
  const priority = input.priority && input.priority !== "all" ? input.priority : null;
  const page = input.page || 1;
  const pageSize = input.pageSize || 20;
  const offset = (page - 1) * pageSize;

  try {
    const { data, error } = await supabase.rpc("search_requests", {
      p_search_query: input.query || "",
      p_user_id: user.id,
      p_is_admin: isAdminUser,
      p_is_manager: isManagerUser,
      p_is_staff: isStaffUser,
      p_user_unit_id: user.unitId || null,
      p_status: status,
      p_priority: priority,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) {
      console.error("Search RPC error:", error);
      return { success: false, error: "Không thể tìm kiếm. Vui lòng thử lại." };
    }

    const requests: SearchRequestResult[] = (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      request_number: r.request_number as number,
      reason: r.reason as string,
      priority: r.priority as Priority,
      status: r.status as RequestStatus,
      created_at: r.created_at as string,
      creator_name: r.creator_name as string | null,
      creator_email: r.creator_email as string | null,
      assignee_name: r.assignee_name as string | null,
      matched_items: r.matched_items as string[] | null,
    }));

    const totalCount = data && data.length > 0 ? Number(data[0].total_count) : 0;

    return { 
      success: true, 
      data: { requests, totalCount } 
    };
  } catch (err) {
    console.error("Search error:", err);
    return { success: false, error: "Lỗi khi tìm kiếm" };
  }
}

// ============================================================
// DASHBOARD STATS (Phase 3)
// ============================================================

export interface DashboardStats {
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  needInfoCount: number;
  doneThisMonth: number;
  overdueCount: number;
  myRequestsCount: number;
  myTasksCount: number;
}

/**
 * Get dashboard statistics based on user role
 */
export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập" };
  }

  const supabase = await createClient();
  const userForPermission = toUserForPermission(user);
  
  const isAdminUser = isAdmin(userForPermission);
  const isManagerUser = userForPermission.roles.includes("manager");
  const isStaffUser = userForPermission.roles.includes("staff");

  try {
    // Build base filter based on role
    const applyRoleFilter = (query: ReturnType<typeof supabase.from>) => {
      if (isAdminUser) return query;
      if (isManagerUser && user.unitId) return query.eq("unit_id", user.unitId);
      if (isStaffUser) return query.eq("assignee_id", user.id);
      return query.eq("created_by", user.id);
    };

    // Parallel queries for all stats
    const [
      newResult,
      assignedResult,
      inProgressResult,
      needInfoResult,
      doneResult,
      myRequestsResult,
      myTasksResult,
    ] = await Promise.all([
      // NEW count
      applyRoleFilter(
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "NEW")
      ),
      // ASSIGNED count
      applyRoleFilter(
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "ASSIGNED")
      ),
      // IN_PROGRESS count
      applyRoleFilter(
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS")
      ),
      // NEED_INFO count
      applyRoleFilter(
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "NEED_INFO")
      ),
      // DONE this month
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "DONE")
        .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      // My requests (created by me, not done/cancelled)
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id)
        .not("status", "in", "(DONE,CANCELLED)"),
      // My tasks (assigned to me, in progress)
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("assignee_id", user.id)
        .in("status", ["ASSIGNED", "IN_PROGRESS", "NEED_INFO"]),
    ]);

    // Get overdue count
    const { count: overdueCount } = await supabase
      .from("request_items")
      .select("id, request:requests!inner(id, status, assignee_id, created_by, unit_id)", { count: "exact", head: true })
      .lt("required_at", new Date().toISOString().split("T")[0])
      .not("request.status", "in", "(DONE,CANCELLED)");

    return {
      success: true,
      data: {
        newCount: newResult.count || 0,
        assignedCount: assignedResult.count || 0,
        inProgressCount: inProgressResult.count || 0,
        needInfoCount: needInfoResult.count || 0,
        doneThisMonth: doneResult.count || 0,
        overdueCount: overdueCount || 0,
        myRequestsCount: myRequestsResult.count || 0,
        myTasksCount: myTasksResult.count || 0,
      },
    };
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return { success: false, error: "Không thể tải thống kê" };
  }
}

