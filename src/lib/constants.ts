/**
 * Application Constants
 * Centralized place for magic strings and config values
 */

// ============================================================
// APP INFO
// ============================================================
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Hệ thống Yêu cầu Công việc";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================
// PAGINATION
// ============================================================
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 25, 50] as const;

// ============================================================
// FILE UPLOAD
// ============================================================
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_REQUEST = 5;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// ============================================================
// TEXT LIMITS (per PRD)
// ============================================================
export const MAX_REASON_LENGTH = 1000;
export const MAX_COMPLETION_NOTE_LENGTH = 500;
export const MAX_CANCEL_REASON_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 1000;

// ============================================================
// RATE LIMITING
// ============================================================
export const RATE_LIMIT_REQUESTS_PER_MINUTE = 5;

// ============================================================
// ROUTES
// ============================================================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  REQUESTS: "/requests",
  REQUEST_CREATE: "/requests/create",
  REQUEST_DETAIL: (id: string) => `/requests/${id}`,
  PROFILE: "/profile",
  ADMIN_USERS: "/admin/users",
  ADMIN_CATEGORIES: "/admin/categories",
  REPORTS: "/reports",
  UNAUTHORIZED: "/unauthorized",
} as const;

// ============================================================
// STATUS DISPLAY CONFIG
// ============================================================
export const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    color: "gray",
    bgClass: "bg-gray-100",
    textClass: "text-gray-800",
  },
  NEW: {
    label: "Mới",
    color: "blue",
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
  },
  ASSIGNED: {
    label: "Đã phân công",
    color: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    color: "purple",
    bgClass: "bg-purple-100",
    textClass: "text-purple-800",
  },
  NEED_INFO: {
    label: "Cần thông tin",
    color: "orange",
    bgClass: "bg-orange-100",
    textClass: "text-orange-800",
  },
  DONE: {
    label: "Hoàn thành",
    color: "green",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
  },
} as const;

// ============================================================
// PRIORITY DISPLAY CONFIG
// ============================================================
export const PRIORITY_CONFIG = {
  LOW: {
    label: "Thấp",
    color: "slate",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
  },
  NORMAL: {
    label: "Bình thường",
    color: "blue",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
  },
  HIGH: {
    label: "Cao",
    color: "orange",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
  },
  URGENT: {
    label: "Khẩn cấp",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
  },
} as const;

// ============================================================
// DEMO MODE CONFIGURATION (for safe demo/preview)
// ============================================================
// Flag to enable demo mode (should only be true in non-production)
export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// When demo mode is enabled, check if we're in production
// Demo mode should NEVER be true in production environment
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

// Safety guard: ensure demo mode is not enabled in production
if (DEMO_MODE_ENABLED && IS_PRODUCTION) {
  console.error(
    "[CRITICAL] Demo mode is enabled in production environment. This is a security risk and should never happen."
  );
  // In a real scenario, you might want to throw an error here
  // throw new Error("Demo mode cannot be enabled in production");
}

// ============================================================
// ADMIN CONTACT (for whitelist rejection message)
// ============================================================
export const ADMIN_EMAIL = "bao.nguyen@eiu.edu.vn";

// ============================================================
// DATABASE RPC FLAGS
// ============================================================
// Flag to use atomic RPCs (requires migration 0003 to be applied)
// Set to "true" after applying migration 0003_create_request_atomic_rpc.sql
export const USE_ATOMIC_RPC = process.env.NEXT_PUBLIC_USE_ATOMIC_RPC === "true";
