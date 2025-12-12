"use client";

import { Clock, User, Edit, Send, UserPlus, Play, Pause, CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface Log {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  meta_data: Record<string, unknown> | null;
  created_at: string;
  user: {
    id: string;
    full_name: string | null;
    email: string;
  } | { id: string; full_name: string | null; email: string }[] | null;
}

interface ActivityLogProps {
  logs: Log[];
}

// Helper to get first item from potential array
const getFirst = <T,>(value: T | T[] | null): T | null => {
  if (Array.isArray(value)) return value[0] || null;
  return value;
};

// Action icons and labels
const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { 
    icon: <Edit className="h-4 w-4" />, 
    label: "Tạo yêu cầu", 
    color: "text-blue-600 bg-blue-100" 
  },
  submitted: { 
    icon: <Send className="h-4 w-4" />, 
    label: "Gửi yêu cầu", 
    color: "text-green-600 bg-green-100" 
  },
  assigned: { 
    icon: <UserPlus className="h-4 w-4" />, 
    label: "Phân công xử lý", 
    color: "text-indigo-600 bg-indigo-100" 
  },
  status_changed: { 
    icon: <Clock className="h-4 w-4" />, 
    label: "Đổi trạng thái", 
    color: "text-purple-600 bg-purple-100" 
  },
  started: { 
    icon: <Play className="h-4 w-4" />, 
    label: "Bắt đầu xử lý", 
    color: "text-purple-600 bg-purple-100" 
  },
  need_info: { 
    icon: <Pause className="h-4 w-4" />, 
    label: "Yêu cầu bổ sung thông tin", 
    color: "text-yellow-600 bg-yellow-100" 
  },
  completed: { 
    icon: <CheckCircle className="h-4 w-4" />, 
    label: "Hoàn thành", 
    color: "text-green-600 bg-green-100" 
  },
  cancelled: { 
    icon: <XCircle className="h-4 w-4" />, 
    label: "Huỷ yêu cầu", 
    color: "text-red-600 bg-red-100" 
  },
  commented: { 
    icon: <MessageSquare className="h-4 w-4" />, 
    label: "Thêm bình luận", 
    color: "text-gray-600 bg-gray-100" 
  },
  updated: { 
    icon: <Edit className="h-4 w-4" />, 
    label: "Cập nhật yêu cầu", 
    color: "text-blue-600 bg-blue-100" 
  },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  NEW: "Mới",
  ASSIGNED: "Đã phân công",
  IN_PROGRESS: "Đang xử lý",
  NEED_INFO: "Cần bổ sung",
  DONE: "Hoàn thành",
  CANCELLED: "Đã huỷ",
};

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDateTime(dateStr);
}

export function ActivityLog({ logs }: ActivityLogProps) {
  // Sort logs by date (oldest first for timeline)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sortedLogs.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        Chưa có hoạt động nào được ghi nhận
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedLogs.map((log, idx) => {
          const user = getFirst(log.user);
          const config = ACTION_CONFIG[log.action] || {
            icon: <Clock className="h-4 w-4" />,
            label: log.action,
            color: "text-gray-600 bg-gray-100",
          };

          // Build description
          let description = config.label;
          if (log.old_status && log.new_status) {
            description = `Đổi trạng thái từ "${STATUS_LABELS[log.old_status] || log.old_status}" sang "${STATUS_LABELS[log.new_status] || log.new_status}"`;
          } else if (log.new_status) {
            description = `${config.label} → ${STATUS_LABELS[log.new_status] || log.new_status}`;
          }

          // Check for note in meta_data
          const note = log.meta_data?.note as string | undefined;
          const assigneeName = log.meta_data?.assignee_name as string | undefined;

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {/* Line connector */}
                {idx !== sortedLogs.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}>
                    {config.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">
                        {user?.full_name || user?.email || "Hệ thống"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {description}
                      </span>
                      {assigneeName && (
                        <span className="text-sm text-gray-700 font-medium">
                          → {assigneeName}
                        </span>
                      )}
                    </div>
                    
                    {/* Note if exists */}
                    {note && (
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 italic">
                        "{note}"
                      </div>
                    )}
                    
                    {/* Time */}
                    <p className="mt-1 text-xs text-gray-400" title={formatDateTime(log.created_at)}>
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
