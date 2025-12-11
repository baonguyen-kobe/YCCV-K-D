import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles, toUserForPermission } from "@/lib/auth";
import {
  canViewRequest,
  canEditRequest,
  canSubmitRequest,
  canChangeStatus,
  canCancelRequest,
  canAssignRequest,
  canComment,
  canViewInternalComments,
  STATE_TRANSITIONS,
} from "@/lib/permissions";
import { ArrowLeft, Edit, Send, UserPlus, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react";
import type { RequestStatus } from "@/types/database.types";
import { RequestActions } from "@/components/requests/request-actions";
import { RequestComments } from "@/components/requests/request-comments";

/**
 * Request Detail Page
 * PRD Section 3.4.4: Chi tiết phiếu yêu cầu
 */
export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuthWithRoles();
  const userForPermission = toUserForPermission(user);
  const supabase = await createClient();

  // Fetch request with all related data
  const { data: request, error } = await supabase
    .from("requests")
    .select(`
      *,
      creator:users!requests_created_by_fkey (
        id, full_name, email, avatar_url
      ),
      assignee:users!requests_assignee_id_fkey (
        id, full_name, email, avatar_url
      ),
      unit:units (
        id, name, code
      ),
      items:request_items (
        id, item_name, category_id, unit_count, quantity, required_at, link_ref, notes, sort_order,
        category:categories (id, name, code)
      ),
      comments:request_comments (
        id, content, is_internal, created_at,
        user:users (id, full_name, email, avatar_url)
      ),
      logs:request_logs (
        id, action, old_status, new_status, meta_data, created_at,
        user:users (id, full_name, email)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !request) {
    notFound();
  }

  // Check view permission
  const requestForPermission = {
    id: request.id,
    status: request.status as RequestStatus,
    created_by: request.created_by,
    assignee_id: request.assignee_id,
    unit_id: request.unit_id,
  };

  if (!canViewRequest(userForPermission, requestForPermission)) {
    notFound();
  }

  // Get first item from potential array (Supabase FK relation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFirst = <T,>(value: T | T[] | null): T | null => {
    if (Array.isArray(value)) return value[0] || null;
    return value;
  };

  const creator = getFirst(request.creator);
  const assignee = getFirst(request.assignee);
  const unit = getFirst(request.unit);
  const items = request.items || [];
  const logs = request.logs || [];
  
  // Filter comments based on permission
  const canSeeInternal = canViewInternalComments(userForPermission);
  const comments = (request.comments || []).filter(
    (c: { is_internal: boolean }) => !c.is_internal || canSeeInternal
  );

  // Calculate permissions
  const permissions = {
    canEdit: canEditRequest(userForPermission, requestForPermission),
    canSubmit: canSubmitRequest(userForPermission, requestForPermission),
    canCancel: canCancelRequest(userForPermission, requestForPermission),
    canAssign: canAssignRequest(userForPermission, requestForPermission),
    canComment: canComment(userForPermission, requestForPermission),
    canCreateInternalComment: canViewInternalComments(userForPermission),
  };

  // Get valid next statuses
  const currentStatus = request.status as RequestStatus;
  const validTransitions = STATE_TRANSITIONS[currentStatus] || [];
  const allowedTransitions = validTransitions.filter((newStatus) =>
    canChangeStatus(userForPermission, requestForPermission, currentStatus, newStatus)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/requests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">#{request.request_number}</h1>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Tạo bởi {creator?.full_name || creator?.email} • {formatDate(request.created_at)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {permissions.canEdit && request.status === "DRAFT" && (
            <Link
              href={`/requests/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          )}
          {permissions.canSubmit && request.status === "DRAFT" && (
            <RequestActions
              requestId={id}
              actionType="submit"
              label="Gửi yêu cầu"
              icon={<Send className="h-4 w-4" />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Thông tin yêu cầu</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Lý do yêu cầu</label>
                <p className="mt-1 whitespace-pre-wrap">{request.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Đơn vị</label>
                  <p className="mt-1">{unit?.name || request.unit_name_snapshot || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Người xử lý</label>
                  <p className="mt-1">{assignee?.full_name || assignee?.email || "Chưa phân công"}</p>
                </div>
              </div>
              {request.completion_note && (
                <div>
                  <label className="text-sm text-gray-500">Ghi chú hoàn thành</label>
                  <p className="mt-1 text-green-700">{request.completion_note}</p>
                </div>
              )}
              {request.cancel_reason && (
                <div>
                  <label className="text-sm text-gray-500">Lý do huỷ</label>
                  <p className="mt-1 text-red-700">{request.cancel_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Request Items */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Danh sách hạng mục ({items.length})</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">Không có hạng mục nào</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Tên</th>
                      <th className="text-left py-2 px-2">Danh mục</th>
                      <th className="text-right py-2 px-2">SL</th>
                      <th className="text-left py-2 px-2">ĐVT</th>
                      <th className="text-left py-2 px-2">Ngày cần</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any, index: number) => {
                      const category = getFirst(item.category);
                      return (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 px-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 px-2">
                            <div>{item.item_name}</div>
                            {item.notes && (
                              <div className="text-xs text-gray-500">{item.notes}</div>
                            )}
                            {item.link_ref && (
                              <a href={item.link_ref} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                Link tham khảo
                              </a>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-500">{category?.name || "-"}</td>
                          <td className="py-2 px-2 text-right">{item.quantity}</td>
                          <td className="py-2 px-2">{item.unit_count || "-"}</td>
                          <td className="py-2 px-2">
                            {item.required_at ? formatDate(item.required_at) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Trao đổi ({comments.length})
            </h2>
            <RequestComments
              requestId={id}
              comments={comments}
              canComment={permissions.canComment}
              canCreateInternal={permissions.canCreateInternalComment}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {(permissions.canAssign || allowedTransitions.length > 0 || permissions.canCancel) && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="font-semibold mb-4">Hành động</h2>
              <div className="space-y-2">
                {permissions.canAssign && (
                  <RequestActions
                    requestId={id}
                    actionType="assign"
                    label="Phân công xử lý"
                    icon={<UserPlus className="h-4 w-4" />}
                    className="w-full justify-center"
                  />
                )}
                
                {allowedTransitions.map((status) => (
                  <RequestActions
                    key={status}
                    requestId={id}
                    actionType="status"
                    newStatus={status}
                    label={getStatusActionLabel(status)}
                    icon={getStatusIcon(status)}
                    className={`w-full justify-center ${getStatusButtonClass(status)}`}
                  />
                ))}

                {permissions.canCancel && !["DONE", "CANCELLED"].includes(request.status) && (
                  <RequestActions
                    requestId={id}
                    actionType="cancel"
                    label="Huỷ yêu cầu"
                    icon={<XCircle className="h-4 w-4" />}
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                    requireConfirm
                  />
                )}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Lịch sử hoạt động</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10).map((log: any) => {
                  const logUser = getFirst(log.user);
                  return (
                    <div key={log.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700">
                            {getActionLabel(log.action, log.old_status, log.new_status)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {logUser?.full_name || logUser?.email || "System"} • {formatDateTime(log.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helper Components & Functions
// ============================================================

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
  if (priority === "LOW" || priority === "NORMAL") return null;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN");
}

function getStatusActionLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    DRAFT: "Chuyển về nháp",
    NEW: "Gửi yêu cầu",
    ASSIGNED: "Phân công",
    IN_PROGRESS: "Bắt đầu xử lý",
    NEED_INFO: "Yêu cầu bổ sung",
    DONE: "Hoàn thành",
    CANCELLED: "Huỷ",
  };
  return labels[status];
}

function getStatusIcon(status: RequestStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4" />;
    case "DONE":
      return <CheckCircle className="h-4 w-4" />;
    case "NEED_INFO":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
}

function getStatusButtonClass(status: RequestStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-purple-600 text-white hover:bg-purple-700";
    case "DONE":
      return "bg-green-600 text-white hover:bg-green-700";
    case "NEED_INFO":
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    default:
      return "";
  }
}

function getActionLabel(action: string, oldStatus: string | null, newStatus: string | null): string {
  if (action === "status_change" && oldStatus && newStatus) {
    const statusLabels: Record<string, string> = {
      DRAFT: "Nháp",
      NEW: "Mới",
      ASSIGNED: "Đã phân công",
      IN_PROGRESS: "Đang xử lý",
      NEED_INFO: "Cần bổ sung",
      DONE: "Hoàn thành",
      CANCELLED: "Đã huỷ",
    };
    return `Chuyển từ "${statusLabels[oldStatus]}" → "${statusLabels[newStatus]}"`;
  }
  
  const actionLabels: Record<string, string> = {
    created: "Tạo yêu cầu",
    assigned: "Phân công xử lý",
    comment_added: "Thêm bình luận",
    status_change: "Thay đổi trạng thái",
  };
  
  return actionLabels[action] || action;
}
