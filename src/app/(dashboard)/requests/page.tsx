import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles } from "@/lib/auth";
import { isAdmin, isManager, isStaff } from "@/lib/permissions";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { RequestFilters } from "@/components/requests/request-filters";
import type { RequestStatus, Priority } from "@/types/database.types";

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: RequestStatus;
    priority?: Priority;
    search?: string;
  }>;
}

/**
 * Requests List Page
 * Shows all requests with filtering, sorting, pagination (PRD Section 3.4)
 */
export default async function RequestsPage({ searchParams }: PageProps) {
  const user = await requireAuthWithRoles();
  const supabase = await createClient();
  const params = await searchParams;

  // Parse query params
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const statusFilter = params.status || "all";
  const priorityFilter = params.priority || "all";
  const searchQuery = params.search || "";

  // Build query
  let query = supabase
    .from("requests")
    .select(`
      id,
      request_number,
      reason,
      priority,
      status,
      created_at,
      updated_at,
      creator:users!requests_created_by_fkey (
        id,
        full_name,
        email
      ),
      assignee:users!requests_assignee_id_fkey (
        id,
        full_name,
        email
      )
    `, { count: "exact" });

  // Apply role-based filters
  const isAdminUser = isAdmin(user);
  const isManagerUser = isManager(user);
  const isStaffUser = isStaff(user);

  if (!isAdminUser) {
    if (isManagerUser && user.unitId) {
      query = query.eq("unit_id", user.unitId);
    } else if (isStaffUser) {
      query = query.eq("assignee_id", user.id);
    } else {
      query = query.eq("created_by", user.id);
    }
  }

  // Apply filters
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (priorityFilter && priorityFilter !== "all") {
    query = query.eq("priority", priorityFilter);
  }
  if (searchQuery) {
    query = query.or(`reason.ilike.%${searchQuery}%,request_number.eq.${parseInt(searchQuery) || 0}`);
  }

  // Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Execute query
  const { data: requests, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching requests:", error);
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  // Build pagination URL helper
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter as string);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(page));
    return `/requests?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách Yêu cầu</h1>
        <Link
          href="/requests/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo yêu cầu
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form action="/requests" method="GET">
              <input
                type="text"
                name="search"
                placeholder="Tìm theo mã hoặc nội dung..."
                defaultValue={searchQuery}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              {priorityFilter !== "all" && <input type="hidden" name="priority" value={priorityFilter} />}
            </form>
          </div>

          {/* Filter Dropdowns (Client Component) */}
          <RequestFilters 
            currentStatus={statusFilter} 
            currentPriority={priorityFilter as string} 
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Hiển thị {requests?.length || 0} / {count || 0} yêu cầu
      </div>

      {/* Request List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {!requests || requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "Không tìm thấy yêu cầu phù hợp"
              : "Chưa có yêu cầu nào"}
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={buildPageUrl(Math.max(1, currentPage - 1))}
            className={`p-2 rounded-lg border ${
              currentPage === 1
                ? "text-gray-300 pointer-events-none"
                : "hover:bg-gray-50"
            }`}
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(pageNum)}
                  className={`px-3 py-1 rounded-lg ${
                    pageNum === currentPage
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-50 border"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          <Link
            href={buildPageUrl(Math.min(totalPages, currentPage + 1))}
            className={`p-2 rounded-lg border ${
              currentPage === totalPages
                ? "text-gray-300 pointer-events-none"
                : "hover:bg-gray-50"
            }`}
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

type RequestUser = { id: string; full_name: string | null; email: string };

interface RequestRowProps {
  request: {
    id: string;
    request_number: number;
    reason: string;
    priority: string;
    status: string;
    created_at: string;
    updated_at: string;
    creator: RequestUser | RequestUser[] | null;
    assignee: RequestUser | RequestUser[] | null;
  };
}

// Helper to extract first item from potential array (Supabase returns array for FK joins)
function getFirst<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value;
}

function RequestRow({ request }: RequestRowProps) {
  const creator = getFirst(request.creator);
  const assignee = getFirst(request.assignee);
  
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500">
              #{request.request_number}
            </span>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
          <p className="mt-1 text-sm text-gray-900 line-clamp-2">
            {request.reason}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>
              Người tạo: {creator?.full_name || creator?.email || "Unknown"}
            </span>
            {assignee && (
              <span>
                Xử lý: {assignee.full_name || assignee.email}
              </span>
            )}
            <span>{formatDate(request.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
    NEW: { label: "Mới", className: "bg-blue-100 text-blue-700" },
    ASSIGNED: { label: "Đã phân công", className: "bg-indigo-100 text-indigo-700" },
    IN_PROGRESS: { label: "Đang xử lý", className: "bg-purple-100 text-purple-700" },
    NEED_INFO: { label: "Cần bổ sung", className: "bg-yellow-100 text-yellow-700" },
    DONE: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Đã huỷ", className: "bg-red-100 text-red-700" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; className: string }> = {
    LOW: { label: "Thấp", className: "bg-gray-100 text-gray-600" },
    NORMAL: { label: "Bình thường", className: "bg-blue-50 text-blue-600" },
    HIGH: { label: "Cao", className: "bg-orange-100 text-orange-700" },
    URGENT: { label: "Khẩn cấp", className: "bg-red-100 text-red-700" },
  };

  const config = priorityConfig[priority] || { label: priority, className: "bg-gray-100 text-gray-600" };

  // Only show badge for HIGH and URGENT
  if (priority === "LOW" || priority === "NORMAL") return null;

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
