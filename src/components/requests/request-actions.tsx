"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRequest, updateRequestStatus, cancelRequest, assignRequest, getStaffList } from "@/actions/requests";
import { toast } from "sonner";
import type { RequestStatus } from "@/types/database.types";
import { MAX_COMPLETION_NOTE_LENGTH, MAX_CANCEL_REASON_LENGTH } from "@/lib/constants";

interface RequestActionsProps {
  requestId: string;
  actionType: "submit" | "status" | "cancel" | "assign";
  newStatus?: RequestStatus;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  requireConfirm?: boolean;
}

export function RequestActions({
  requestId,
  actionType,
  newStatus,
  label,
  icon,
  className = "",
  requireConfirm = false,
}: RequestActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [note, setNote] = useState("");
  const [staffList, setStaffList] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const handleClick = async () => {
    // Show dialog for: cancel, assign, DONE, NEED_INFO transitions
    if (requireConfirm || actionType === "cancel" || actionType === "assign" || newStatus === "DONE" || newStatus === "NEED_INFO") {
      if (actionType === "assign") {
        // Load staff list
        const result = await getStaffList();
        if (result.success && result.data) {
          setStaffList(result.data);
        }
      }
      setShowDialog(true);
      return;
    }

    await executeAction();
  };

  const executeAction = async () => {
    setIsLoading(true);
    try {
      let result;

      switch (actionType) {
        case "submit":
          result = await submitRequest(requestId);
          break;
        case "status":
          if (!newStatus) return;
          result = await updateRequestStatus(requestId, newStatus, note || undefined);
          break;
        case "cancel":
          result = await cancelRequest(requestId, note || undefined);
          break;
        case "assign":
          if (!selectedStaff) {
            toast.error("Vui lòng chọn người xử lý");
            setIsLoading(false);
            return;
          }
          result = await assignRequest(requestId, selectedStaff);
          break;
      }

      if (result?.success) {
        toast.success("Thao tác thành công!");
        setShowDialog(false);
        router.refresh();
      } else {
        toast.error(result?.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 ${className}`}
      >
        {icon}
        {label}
      </button>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-4">
              {actionType === "cancel" ? "Xác nhận huỷ yêu cầu" : 
               actionType === "assign" ? "Phân công xử lý" :
               newStatus === "DONE" ? "Hoàn thành yêu cầu" :
               newStatus === "NEED_INFO" ? "Yêu cầu bổ sung thông tin" :
               "Xác nhận thao tác"}
            </h3>

            {actionType === "assign" ? (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Chọn người xử lý
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (actionType === "cancel" || newStatus === "DONE" || newStatus === "NEED_INFO") && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  {actionType === "cancel" ? "Lý do huỷ (tuỳ chọn)" : 
                   newStatus === "NEED_INFO" ? "Mô tả thông tin cần bổ sung *" :
                   "Ghi chú hoàn thành (tuỳ chọn)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={actionType === "cancel" ? MAX_CANCEL_REASON_LENGTH : MAX_COMPLETION_NOTE_LENGTH}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder={actionType === "cancel" ? "Nhập lý do huỷ..." : 
                              newStatus === "NEED_INFO" ? "Mô tả chi tiết thông tin cần bổ sung từ người yêu cầu..." :
                              "Nhập ghi chú..."}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${note.length > (actionType === "cancel" ? MAX_CANCEL_REASON_LENGTH : MAX_COMPLETION_NOTE_LENGTH) * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {note.length}/{actionType === "cancel" ? MAX_CANCEL_REASON_LENGTH : MAX_COMPLETION_NOTE_LENGTH}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDialog(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={executeAction}
                disabled={isLoading || (actionType === "assign" && !selectedStaff) || (newStatus === "NEED_INFO" && !note.trim())}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === "cancel" 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
