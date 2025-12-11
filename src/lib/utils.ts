import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
}

/**
 * Format datetime to Vietnamese locale
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate a random string (for temp tokens, etc.)
 */
export function generateRandomString(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a date is overdue (past today)
 */
export function isOverdue(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const targetDate = new Date(d);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate.getTime() === tomorrow.getTime();
}

/**
 * Get status badge color based on request status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    NEW: "bg-blue-100 text-blue-800",
    ASSIGNED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    NEED_INFO: "bg-orange-100 text-orange-800",
    DONE: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700",
    NORMAL: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };
  return colors[priority] || "bg-gray-100 text-gray-700";
}

/**
 * Get Vietnamese label for status
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Nháp",
    NEW: "Mới",
    ASSIGNED: "Đã phân công",
    IN_PROGRESS: "Đang xử lý",
    NEED_INFO: "Cần thông tin",
    DONE: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };
  return labels[status] || status;
}

/**
 * Get Vietnamese label for priority
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: "Thấp",
    NORMAL: "Bình thường",
    HIGH: "Cao",
    URGENT: "Khẩn cấp",
  };
  return labels[priority] || priority;
}
