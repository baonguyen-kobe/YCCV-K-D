"use client";

import Link from "next/link";
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck, 
  Send, 
  HelpCircle,
  TrendingUp 
} from "lucide-react";

interface StatsData {
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  needInfoCount: number;
  doneThisMonth: number;
  overdueCount: number;
  myRequestsCount: number;
  myTasksCount: number;
}

interface DashboardWidgetsProps {
  stats: StatsData;
  userRoles: string[];
  userName?: string;
}

export function DashboardWidgets({ stats, userRoles, userName }: DashboardWidgetsProps) {
  const isAdmin = userRoles.includes("admin");
  const isManager = userRoles.includes("manager");
  const isStaff = userRoles.includes("staff");
  const isUser = userRoles.includes("user");

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Xin chào, {userName || "Người dùng"}! 👋
        </h1>
        <p className="mt-1 text-blue-100">
          {isAdmin || isManager
            ? "Quản lý và theo dõi các yêu cầu công việc của tổ chức"
            : isStaff
            ? "Xem và xử lý các công việc được giao"
            : "Tạo và theo dõi các yêu cầu công việc của bạn"}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Phiếu mới"
          value={stats.newCount}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
          href="/requests?status=NEW"
          description="Chưa được phân công"
        />
        <StatCard
          title="Đang xử lý"
          value={stats.assignedCount + stats.inProgressCount}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
          href="/requests?status=IN_PROGRESS"
          description="Đang được xử lý"
        />
        <StatCard
          title="Quá hạn"
          value={stats.overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={stats.overdueCount > 0 ? "red" : "gray"}
          href="/requests?overdue=true"
          description="Cần ưu tiên xử lý"
        />
        <StatCard
          title="Hoàn thành tháng này"
          value={stats.doneThisMonth}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          href="/requests?status=DONE"
          description={`Tháng ${new Date().getMonth() + 1}`}
        />
      </div>

      {/* Role-specific Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks Widget (Staff) */}
        {(isStaff || isAdmin) && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                Việc của tôi
              </h2>
              <Link href="/requests?assignee=me" className="text-sm text-blue-600 hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.myTasksCount}</div>
                <div className="text-xs text-gray-600">Được giao</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.needInfoCount}</div>
                <div className="text-xs text-gray-600">Cần bổ sung</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.inProgressCount}</div>
                <div className="text-xs text-gray-600">Đang xử lý</div>
              </div>
            </div>
          </div>
        )}

        {/* My Requests Widget (User) */}
        {(isUser || isManager) && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Yêu cầu của tôi
              </h2>
              <Link href="/requests?creator=me" className="text-sm text-blue-600 hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.myRequestsCount}</div>
                <div className="text-xs text-gray-600">Đang chờ</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.needInfoCount}</div>
                <div className="text-xs text-gray-600">Cần bổ sung</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.doneThisMonth}</div>
                <div className="text-xs text-gray-600">Hoàn thành</div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Quick Actions */}
        {(isAdmin || isManager) && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Hành động nhanh
            </h2>
            <div className="space-y-2">
              {stats.newCount > 0 && (
                <Link
                  href="/requests?status=NEW"
                  className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Phiếu chờ phân công
                  </span>
                  <span className="font-bold">{stats.newCount}</span>
                </Link>
              )}
              {stats.needInfoCount > 0 && (
                <Link
                  href="/requests?status=NEED_INFO"
                  className="flex items-center justify-between p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Phiếu cần bổ sung thông tin
                  </span>
                  <span className="font-bold">{stats.needInfoCount}</span>
                </Link>
              )}
              {stats.overdueCount > 0 && (
                <Link
                  href="/requests?overdue=true"
                  className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Phiếu quá hạn
                  </span>
                  <span className="font-bold">{stats.overdueCount}</span>
                </Link>
              )}
              {stats.newCount === 0 && stats.needInfoCount === 0 && stats.overdueCount === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Tất cả đang được xử lý tốt!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Widget for regular users */}
        {!isAdmin && !isManager && !isStaff && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-gray-600" />
              Hướng dẫn nhanh
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <span>Nhấn "Tạo yêu cầu" để tạo phiếu mới</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <span>Điền thông tin và thêm các hạng mục cần thiết</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <span>Lưu nháp hoặc gửi ngay để chờ xử lý</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <span>Theo dõi trạng thái tại danh sách yêu cầu</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({
  title,
  value,
  icon,
  color,
  href,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "red" | "green" | "gray";
  href: string;
  description?: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    gray: "text-gray-600 bg-gray-50",
  };

  const valueColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    red: "text-red-600",
    green: "text-green-600",
    gray: "text-gray-600",
  };

  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className={`p-2 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-bold mt-2 ${valueColorClasses[color]}`}>
        {value}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </Link>
  );
}
