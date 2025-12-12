/**
 * Zod Validation Schemas
 * Centralized validation for all Server Actions
 * Based on PRD constraints
 */

import { z } from "zod";
import {
  MAX_REASON_LENGTH,
  MAX_COMPLETION_NOTE_LENGTH,
  MAX_CANCEL_REASON_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

// ============================================================
// COMMON SCHEMAS
// ============================================================

export const uuidSchema = z.string().uuid("ID không hợp lệ");

export const emailSchema = z
  .string()
  .email("Email không hợp lệ")
  .max(255, "Email quá dài");

export const prioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"], {
  message: "Mức ưu tiên không hợp lệ",
});

export const statusSchema = z.enum(
  ["DRAFT", "NEW", "ASSIGNED", "IN_PROGRESS", "NEED_INFO", "DONE", "CANCELLED"],
  {
    message: "Trạng thái không hợp lệ",
  }
);

// ============================================================
// REQUEST SCHEMAS
// ============================================================

/**
 * Schema for request item (in create/update request)
 */
export const requestItemSchema = z.object({
  category_id: uuidSchema.optional().nullable(),
  item_name: z
    .string()
    .min(1, "Tên hạng mục không được để trống")
    .max(500, "Tên hạng mục quá dài (tối đa 500 ký tự)"),
  unit_count: z.string().max(50, "Đơn vị tính quá dài").optional().nullable(),
  quantity: z
    .number()
    .min(0.01, "Số lượng phải lớn hơn 0")
    .max(999999, "Số lượng quá lớn")
    .default(1),
  required_at: z.string().date("Ngày không hợp lệ").optional().nullable(),
  link_ref: z.string().url("Link không hợp lệ").optional().nullable().or(z.literal("")),
  notes: z.string().max(500, "Ghi chú quá dài").optional().nullable(),
});

/**
 * Schema for creating a new request
 */
export const createRequestSchema = z.object({
  reason: z
    .string()
    .min(1, "Lý do/Căn cứ không được để trống")
    .max(MAX_REASON_LENGTH, `Lý do/Căn cứ tối đa ${MAX_REASON_LENGTH} ký tự`),
  priority: prioritySchema.default("NORMAL"),
  items: z
    .array(requestItemSchema)
    .min(1, "Cần ít nhất 1 hạng mục")
    .max(50, "Tối đa 50 hạng mục"),
});

/**
 * Schema for updating a request (DRAFT only)
 */
export const updateRequestSchema = z.object({
  id: uuidSchema,
  reason: z
    .string()
    .min(1, "Lý do/Căn cứ không được để trống")
    .max(MAX_REASON_LENGTH, `Lý do/Căn cứ tối đa ${MAX_REASON_LENGTH} ký tự`)
    .optional(),
  priority: prioritySchema.optional(),
});

/**
 * Schema for submitting a request (DRAFT -> NEW)
 */
export const submitRequestSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema for assigning a request
 */
export const assignRequestSchema = z.object({
  request_id: uuidSchema,
  assignee_id: uuidSchema,
  note: z.string().max(500, "Ghi chú quá dài").optional(),
});

/**
 * Schema for changing request status
 */
export const changeStatusSchema = z.object({
  request_id: uuidSchema,
  new_status: statusSchema,
  note: z.string().max(500, "Ghi chú quá dài").optional(),
  completion_note: z
    .string()
    .max(MAX_COMPLETION_NOTE_LENGTH, `Ghi chú hoàn thành tối đa ${MAX_COMPLETION_NOTE_LENGTH} ký tự`)
    .optional(),
  cancel_reason: z
    .string()
    .max(MAX_CANCEL_REASON_LENGTH, `Lý do hủy tối đa ${MAX_CANCEL_REASON_LENGTH} ký tự`)
    .optional(),
});

/**
 * Schema for cancelling a request
 */
export const cancelRequestSchema = z.object({
  request_id: uuidSchema,
  reason: z
    .string()
    .min(1, "Vui lòng nhập lý do hủy")
    .max(MAX_CANCEL_REASON_LENGTH, `Lý do hủy tối đa ${MAX_CANCEL_REASON_LENGTH} ký tự`),
});

// ============================================================
// COMMENT SCHEMAS
// ============================================================

/**
 * Schema for adding a comment
 */
export const addCommentSchema = z.object({
  request_id: uuidSchema,
  content: z
    .string()
    .min(1, "Nội dung không được để trống")
    .max(MAX_COMMENT_LENGTH, `Nội dung tối đa ${MAX_COMMENT_LENGTH} ký tự`),
  is_internal: z.boolean().default(false),
});

// ============================================================
// ATTACHMENT SCHEMAS
// ============================================================

/**
 * Schema for file upload metadata
 */
export const attachmentSchema = z.object({
  request_id: uuidSchema.optional().nullable(),
  file_name: z.string().min(1, "Tên file không được để trống").max(255),
  file_type: z.enum(["file", "external_url"]),
  file_size: z.number().max(MAX_FILE_SIZE_BYTES, "File quá lớn (tối đa 5MB)").optional(),
  file_url: z.string().min(1, "URL file không được để trống"),
  mime_type: z.string().optional(),
  temp_token: z.string().optional(),
});

/**
 * Schema for external URL attachment
 */
export const externalUrlSchema = z.object({
  request_id: uuidSchema.optional().nullable(),
  file_name: z.string().min(1, "Tên không được để trống").max(255),
  file_url: z.string().url("URL không hợp lệ"),
  temp_token: z.string().optional(),
});

// ============================================================
// USER SCHEMAS
// ============================================================

/**
 * Schema for creating a user (Admin)
 */
export const createUserSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(1, "Họ tên không được để trống").max(255),
  phone: z.string().max(20, "Số điện thoại quá dài").optional(),
  unit_id: uuidSchema.optional().nullable(),
  role_ids: z.array(uuidSchema).min(1, "Cần chọn ít nhất 1 vai trò"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(100, "Mật khẩu quá dài")
    .optional(), // Optional if using Google OAuth
});

/**
 * Schema for updating user profile (self)
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(1, "Họ tên không được để trống").max(255).optional(),
  phone: z.string().max(20, "Số điện thoại quá dài").optional().nullable(),
  avatar_url: z.string().url("URL avatar không hợp lệ").optional().nullable(),
});

/**
 * Schema for updating user (Admin)
 */
export const updateUserSchema = z.object({
  id: uuidSchema,
  full_name: z.string().max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  unit_id: uuidSchema.optional().nullable(),
  role_ids: z.array(uuidSchema).optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// CATEGORY SCHEMAS
// ============================================================

/**
 * Schema for creating/updating a category
 */
export const categorySchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1, "Tên danh mục không được để trống").max(255),
  code: z.string().max(50, "Mã quá dài").optional().nullable(),
  description: z.string().max(500, "Mô tả quá dài").optional().nullable(),
  parent_id: uuidSchema.optional().nullable(),
  unit_id: uuidSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

// ============================================================
// AUTH SCHEMAS
// ============================================================

/**
 * Schema for login with email/password
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

// ============================================================
// FILTER/SEARCH SCHEMAS
// ============================================================

/**
 * Schema for request list filters
 */
export const requestFiltersSchema = z.object({
  status: z.array(statusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  created_by: uuidSchema.optional(),
  assignee_id: uuidSchema.optional(),
  unit_id: uuidSchema.optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  search: z.string().max(100, "Từ khóa tìm kiếm quá dài").optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(["created_at", "updated_at", "priority", "status"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type CancelRequestInput = z.infer<typeof cancelRequestSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestFilters = z.infer<typeof requestFiltersSchema>;

// ============================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================

/**
 * Standard validation result type for Server Actions
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Validate input using Zod schema and return standardized result
 * Use this at the start of every Server Action for consistent validation
 * 
 * @example
 * const validation = validateInput(createRequestSchema, input);
 * if (!validation.success) {
 *   return { success: false, error: validation.error };
 * }
 * // validation.data is typed and safe to use
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    // Extract field errors for detailed feedback
    const fieldErrors: Record<string, string[]> = {};
    for (const error of result.error.issues) {
      const path = error.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(error.message);
    }

    // Get first error message for simple error display
    const firstError = result.error.issues[0]?.message || "Dữ liệu không hợp lệ";

    return {
      success: false,
      error: firstError,
      fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Format validation errors for UI display
 */
export function formatValidationErrors(fieldErrors: Record<string, string[]>): string {
  const messages: string[] = [];
  for (const [field, errors] of Object.entries(fieldErrors)) {
    messages.push(`${field}: ${errors.join(", ")}`);
  }
  return messages.join("; ");
}
