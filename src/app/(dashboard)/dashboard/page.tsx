import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles } from "@/lib/auth";
import { isAdmin, isManager, isStaff } from "@/lib/permissions";
import Link from "next/link";
import { FileText, Clock, AlertTriangle, CheckCircle, Plus, ArrowRight } from "lucide-react";

/**
 * Dashboard Page
 * Shows overview widgets based on user role (PRD Section 3.8)
 */
export default async function DashboardPage() {
  const user = await requireAuthWithRoles();
  const supabase = await createClient();

  // Get dashboard stats based on user role
  const stats = await getDashboardStats(supabase, user);
  const recentRequests = await getRecentRequests(supabase, user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/requests/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo yêu cầu
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Phiếu mới"
          value={stats.newCount}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
          href="/requests?status=NEW"
        />
        <StatCard
          title="Đang xử lý"
          value={stats.inProgressCount}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
          href="/requests?status=IN_PROGRESS"
        />
        <StatCard
          title="Quá hạn"
          value={stats.overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          href="/requests?overdue=true"
        />
        <StatCard
          title="Hoàn thành tháng này"
          value={stats.doneThisMonth}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          href="/requests?status=DONE"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Yêu cầu gần đây</h2>
          <Link href="/requests" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y">
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có yêu cầu nào
            </div>
          ) : (
            recentRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{request.request_number}
                      </span>
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                    <p className="mt-1 text-sm text-gray-900 truncate">
                      {request.reason}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {request.creator?.full_name || "Unknown"} • {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions for different roles */}
      {(isAdmin(user) || isManager(user)) && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Hành động nhanh</h3>
          <div className="flex flex-wrap gap-2">
            {stats.pendingAssignment > 0 && (
              <Link
                href="/requests?status=NEW"
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                {stats.pendingAssignment} phiếu chờ phân công
              </Link>
            )}
            {stats.needInfoCount > 0 && (
              <Link
                href="/requests?status=NEED_INFO"
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200 transition-colors"
              >
                {stats.needInfoCount} phiếu cần bổ sung thông tin
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "red" | "green";
  href: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
  };

  const valueColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    red: "text-red-600",
    green: "text-green-600",
  };

  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className={`text-3xl font-bold mt-2 ${valueColorClasses[color]}`}>
        {value}
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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    return "Vừa xong";
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} giờ trước`;
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)} ngày trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

// ============================================================
// Data Fetching Functions
// ============================================================

type UserForDashboard = {
  id: string;
  roles: string[];
  unitId: string | null;
};

type RecentRequest = {
  id: string;
  request_number: number;
  reason: string;
  priority: string;
  status: string;
  created_at: string;
  creator: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDashboardStats(supabase: any, user: UserForDashboard) {
  const isAdminUser = isAdmin(user);
  const isManagerUser = isManager(user);
  const isStaffUser = isStaff(user);

  // Base query builder
  const buildQuery = (statuses?: string[]) => {
    let query = supabase.from("requests").select("id", { count: "exact", head: true });
    
    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses);
    }

    // Apply role-based filters
    if (!isAdminUser) {
      if (isManagerUser && user.unitId) {
        // Manager sees requests from their unit
        query = query.eq("unit_id", user.unitId);
      } else if (isStaffUser) {
        // Staff sees assigned requests
        query = query.eq("assignee_id", user.id);
      } else {
        // Regular user sees own requests
        query = query.eq("created_by", user.id);
      }
    }

    return query;
  };

  // Get counts in parallel
  const [newResult, inProgressResult, doneResult, needInfoResult, assignedResult] = await Promise.all([
    buildQuery(["NEW"]),
    buildQuery(["ASSIGNED", "IN_PROGRESS"]),
    // Done this month
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "DONE")
      .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    buildQuery(["NEED_INFO"]),
    buildQuery(["ASSIGNED"]),
  ]);

  // Get overdue count (items with required_at in the past and not DONE/CANCELLED)
  const { count: overdueCount } = await supabase
    .from("request_items")
    .select("id, request:requests!inner(id, status)", { count: "exact", head: true })
    .lt("required_at", new Date().toISOString())
    .not("request.status", "in", "(DONE,CANCELLED)");

  return {
    newCount: newResult.count || 0,
    inProgressCount: inProgressResult.count || 0,
    doneThisMonth: doneResult.count || 0,
    overdueCount: overdueCount || 0,
    needInfoCount: needInfoResult.count || 0,
    pendingAssignment: assignedResult.count || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRecentRequests(supabase: any, user: UserForDashboard): Promise<RecentRequest[]> {
  const isAdminUser = isAdmin(user);
  const isManagerUser = isManager(user);
  const isStaffUser = isStaff(user);

  let query = supabase
    .from("requests")
    .select(`
      id,
      request_number,
      reason,
      priority,
      status,
      created_at,
      creator:users!requests_created_by_fkey (
        id,
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Apply role-based filters
  if (!isAdminUser) {
    if (isManagerUser && user.unitId) {
      query = query.eq("unit_id", user.unitId);
    } else if (isStaffUser) {
      query = query.eq("assignee_id", user.id);
    } else {
      query = query.eq("created_by", user.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching recent requests:", error);
    return [];
  }

  return data || [];
}
