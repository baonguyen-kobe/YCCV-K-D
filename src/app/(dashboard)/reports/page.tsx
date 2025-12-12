import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import { hasAnyRole, ROLES, isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { BarChart3, FileText, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react";

/**
 * Reports Page
 * PRD Section 6: Báo cáo tổng hợp
 */
export default async function ReportsPage() {
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);

  // Admin and Manager can access reports
  if (!hasAnyRole(userForPermission, [ROLES.ADMIN, ROLES.MANAGER])) {
    redirect("/unauthorized");
  }

  const supabase = await createClient();
  const isUserAdmin = isAdmin(userForPermission);

  // Build query based on role
  let requestsQuery = supabase.from("requests").select("status, priority, created_at, unit_id");
  
  if (!isUserAdmin) {
    // Manager can only see their unit's data
    requestsQuery = requestsQuery.eq("unit_id", userForPermission.unitId);
  }

  const { data: requests } = await requestsQuery;

  // Calculate statistics
  const stats = {
    total: requests?.length || 0,
    byStatus: {
      DRAFT: 0,
      NEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      NEED_INFO: 0,
      DONE: 0,
      CANCELLED: 0,
    },
    byPriority: {
      LOW: 0,
      NORMAL: 0,
      HIGH: 0,
      URGENT: 0,
    },
    thisMonth: 0,
    lastMonth: 0,
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  requests?.forEach((req) => {
    // Count by status
    if (req.status in stats.byStatus) {
      stats.byStatus[req.status as keyof typeof stats.byStatus]++;
    }
    // Count by priority
    if (req.priority in stats.byPriority) {
      stats.byPriority[req.priority as keyof typeof stats.byPriority]++;
    }
    // Count by month
    const createdAt = new Date(req.created_at);
    if (createdAt >= thisMonthStart) {
      stats.thisMonth++;
    } else if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
      stats.lastMonth++;
    }
  });

  const completionRate = stats.total > 0 
    ? Math.round((stats.byStatus.DONE / stats.total) * 100) 
    : 0;

  const pendingCount = stats.byStatus.NEW + stats.byStatus.ASSIGNED + stats.byStatus.IN_PROGRESS + stats.byStatus.NEED_INFO;

  const monthlyGrowth = stats.lastMonth > 0
    ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
    : stats.thisMonth > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Báo cáo Tổng hợp</h1>
          <p className="text-gray-500">
            {isUserAdmin ? "Toàn hệ thống" : "Đơn vị của bạn"}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng yêu cầu</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đang xử lý</p>
              <p className="text-3xl font-bold mt-1">{pendingCount}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hoàn thành</p>
              <p className="text-3xl font-bold mt-1">{stats.byStatus.DONE}</p>
              <p className="text-sm text-green-600 mt-1">{completionRate}% tỷ lệ</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tháng này</p>
              <p className="text-3xl font-bold mt-1">{stats.thisMonth}</p>
              <p className={`text-sm mt-1 ${monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {monthlyGrowth >= 0 ? "+" : ""}{monthlyGrowth}% so với tháng trước
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Theo Trạng thái</h2>
          <div className="space-y-3">
            {[
              { label: "Nháp", value: stats.byStatus.DRAFT, color: "bg-gray-500", icon: FileText },
              { label: "Mới", value: stats.byStatus.NEW, color: "bg-blue-500", icon: FileText },
              { label: "Đã phân công", value: stats.byStatus.ASSIGNED, color: "bg-indigo-500", icon: FileText },
              { label: "Đang xử lý", value: stats.byStatus.IN_PROGRESS, color: "bg-yellow-500", icon: Clock },
              { label: "Cần thông tin", value: stats.byStatus.NEED_INFO, color: "bg-orange-500", icon: AlertTriangle },
              { label: "Hoàn thành", value: stats.byStatus.DONE, color: "bg-green-500", icon: CheckCircle },
              { label: "Đã hủy", value: stats.byStatus.CANCELLED, color: "bg-red-500", icon: XCircle },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${item.color.replace("bg-", "text-")}`} />
                <span className="flex-1 text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Theo Độ ưu tiên</h2>
          <div className="space-y-3">
            {[
              { label: "Khẩn cấp", value: stats.byPriority.URGENT, color: "bg-red-500" },
              { label: "Cao", value: stats.byPriority.HIGH, color: "bg-orange-500" },
              { label: "Bình thường", value: stats.byPriority.NORMAL, color: "bg-blue-500" },
              { label: "Thấp", value: stats.byPriority.LOW, color: "bg-gray-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Tổng quan nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats.byStatus.NEW}</p>
            <p className="text-sm text-gray-500">Chờ xử lý</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.NEED_INFO}</p>
            <p className="text-sm text-gray-500">Cần bổ sung</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.byPriority.URGENT}</p>
            <p className="text-sm text-gray-500">Khẩn cấp</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
            <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
}
