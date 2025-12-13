"use client";

import { useState } from "react";
import { upsertStatus, deleteStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Edit2, Trash2, X } from "lucide-react";

const STATUS_COLORS = [
  { name: "Xanh lam", value: "blue" },
  { name: "Xanh lá", value: "green" },
  { name: "Vàng", value: "amber" },
  { name: "Cam", value: "orange" },
  { name: "Đỏ", value: "red" },
  { name: "Tím", value: "purple" },
  { name: "Xám", value: "gray" },
];

interface Status {
  id: string;
  name: string;
  code: string;
  color: string | null;
  description: string | null;
  is_final: boolean;
  is_active: boolean;
}

interface StatusManagementProps {
  statuses: Status[];
}

export function StatusManagement({ statuses: initialStatuses }: StatusManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statuses, setStatuses] = useState(initialStatuses);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    color: "blue",
    description: "",
    is_final: false,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingStatus(null);
    setFormData({
      name: "",
      code: "",
      color: "blue",
      description: "",
      is_final: false,
      is_active: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (status: Status) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      code: status.code,
      color: status.color || "blue",
      description: status.description || "",
      is_final: status.is_final,
      is_active: status.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên trạng thái bắt buộc";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Mã trạng thái bắt buộc";
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Mã phải là chữ hoa, số, dấu gạch dưới";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await upsertStatus({
        id: editingStatus?.id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        color: formData.color || undefined,
        description: formData.description.trim() || undefined,
        is_final: formData.is_final,
        is_active: formData.is_active,
      });

      if (result.success) {
        if (editingStatus) {
          setStatuses(statuses.map((s) => (s.id === editingStatus.id ? { ...s, ...formData } : s)));
          toast.success("Đã cập nhật trạng thái");
        } else {
          const newStatus = { ...formData, id: result.data?.id || "" } as Status;
          setStatuses([...statuses, newStatus]);
          toast.success("Đã tạo trạng thái");
        }
        setShowModal(false);
      } else {
        toast.error(result.error || "Lỗi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (statusId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa trạng thái này?")) return;

    try {
      const result = await deleteStatus(statusId);
      if (result.success) {
        setStatuses(statuses.filter((s) => s.id !== statusId));
        toast.success("Đã xóa trạng thái");
      } else {
        toast.error(result.error || "Lỗi");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const getColorClass = (color: string | null) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      amber: "bg-amber-50 border-amber-200 text-amber-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      gray: "bg-gray-50 border-gray-200 text-gray-700",
    };
    return colorMap[color || "blue"];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quản lý Trạng thái</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm trạng thái
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Mã</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Màu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Cuối cùng?</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {statuses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Không có trạng thái
                </td>
              </tr>
            ) : (
              statuses.map((status) => (
                <tr key={status.id} className={`hover:bg-gray-50 ${getColorClass(status.color)}`}>
                  <td className="px-6 py-3 font-medium">{status.name}</td>
                  <td className="px-6 py-3 font-mono text-sm">{status.code}</td>
                  <td className="px-6 py-3">
                    <div
                      className={`inline-block w-6 h-6 rounded border-2 ${
                        {
                          blue: "bg-blue-500",
                          green: "bg-green-500",
                          amber: "bg-amber-500",
                          orange: "bg-orange-500",
                          red: "bg-red-500",
                          purple: "bg-purple-500",
                          gray: "bg-gray-500",
                        }[status.color || "blue"]
                      }`}
                    />
                  </td>
                  <td className="px-6 py-3">
                    {status.is_final ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        ✓ Có
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(status)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(status.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {editingStatus ? "Chỉnh sửa" : "Thêm"} trạng thái
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mã (ví dụ: PENDING) *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 font-mono ${
                    errors.code ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Màu</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUS_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, color: col.value }))}
                      className={`h-12 rounded border-2 transition ${
                        formData.color === col.value
                          ? "border-gray-900 scale-110"
                          : "border-gray-200"
                      } ${
                        {
                          blue: "bg-blue-500",
                          green: "bg-green-500",
                          amber: "bg-amber-500",
                          orange: "bg-orange-500",
                          red: "bg-red-500",
                          purple: "bg-purple-500",
                          gray: "bg-gray-500",
                        }[col.value]
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_final}
                    onChange={(e) => setFormData((p) => ({ ...p, is_final: e.target.checked }))}
                  />
                  <span className="text-sm font-medium">Trạng thái cuối cùng?</span>
                  <span className="text-xs text-gray-500">(yêu cầu không thể thay đổi sau)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                  <span className="text-sm font-medium">Hoạt động</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
