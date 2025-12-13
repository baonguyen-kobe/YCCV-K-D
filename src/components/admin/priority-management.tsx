"use client";

import { useState } from "react";
import { upsertPriority, deletePriority } from "@/actions/admin";
import { toast } from "sonner";
import { Edit2, Trash2, X, GripVertical } from "lucide-react";

const DEFAULT_COLORS = [
  { name: "Xanh", value: "green" },
  { name: "Xanh lam", value: "blue" },
  { name: "Vàng", value: "amber" },
  { name: "Cam", value: "orange" },
  { name: "Đỏ", value: "red" },
  { name: "Tím", value: "purple" },
];

interface Priority {
  id: string;
  name: string;
  level: number;
  color: string | null;
  description: string | null;
  is_active: boolean;
}

interface PriorityManagementProps {
  priorities: Priority[];
}

export function PriorityManagement({ priorities: initialPriorities }: PriorityManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priorities, setPriorities] = useState(
    initialPriorities.sort((a, b) => a.level - b.level)
  );

  const [formData, setFormData] = useState({
    name: "",
    level: 0,
    color: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingPriority(null);
    setFormData({
      name: "",
      level: (Math.max(...priorities.map((p) => p.level), 0) + 1) * 10,
      color: "blue",
      description: "",
      is_active: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (priority: Priority) => {
    setEditingPriority(priority);
    setFormData({
      name: priority.name,
      level: priority.level,
      color: priority.color || "blue",
      description: priority.description || "",
      is_active: priority.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên mức ưu tiên bắt buộc";
    }
    if (formData.level < 0) {
      newErrors.level = "Mức phải >= 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await upsertPriority({
        id: editingPriority?.id,
        name: formData.name.trim(),
        level: formData.level,
        color: formData.color || undefined,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });

      if (result.success) {
        if (editingPriority) {
          setPriorities(
            priorities
              .map((p) => (p.id === editingPriority.id ? { ...p, ...formData } : p))
              .sort((a, b) => a.level - b.level)
          );
          toast.success("Đã cập nhật mức ưu tiên");
        } else {
          const newPriority = { ...formData, id: result.data?.id || "" } as Priority;
          setPriorities([...priorities, newPriority].sort((a, b) => a.level - b.level));
          toast.success("Đã tạo mức ưu tiên");
        }
        setShowModal(false);
      } else {
        toast.error(result.error || "Lỗi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (priorityId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    try {
      const result = await deletePriority(priorityId);
      if (result.success) {
        setPriorities(priorities.filter((p) => p.id !== priorityId));
        toast.success("Đã xóa mức ưu tiên");
      } else {
        toast.error(result.error || "Lỗi");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const getColorClass = (color: string | null) => {
    const colorMap: Record<string, string> = {
      green: "bg-green-100 text-green-700 border-green-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      amber: "bg-amber-100 text-amber-700 border-amber-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      red: "bg-red-100 text-red-700 border-red-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colorMap[color || "blue"];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quản lý Mức Ưu tiên</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm mức ưu tiên
        </button>
      </div>

      <div className="space-y-2">
        {priorities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có mức ưu tiên</div>
        ) : (
          priorities.map((priority) => (
            <div
              key={priority.id}
              className={`flex items-center gap-4 p-4 border rounded-lg ${getColorClass(priority.color)}`}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <h4 className="font-semibold">{priority.name}</h4>
                <p className="text-sm opacity-75">{priority.description || "-"}</p>
              </div>
              <div className="text-sm">Mức: {priority.level}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(priority)}
                  className="p-2 hover:bg-black/10 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(priority.id)}
                  className="p-2 hover:bg-black/10 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {editingPriority ? "Chỉnh sửa" : "Thêm"} mức ưu tiên
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
                <label className="block text-sm font-medium mb-1">Mức *</label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData((p) => ({ ...p, level: parseInt(e.target.value) }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.level ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level}</p>}
                <p className="text-xs text-gray-500 mt-1">Mức cao hơn = ưu tiên cao hơn</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Màu</label>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, color: col.value }))}
                      className={`p-3 rounded text-sm font-medium border-2 transition ${
                        formData.color === col.value
                          ? `border-gray-900 ${getColorClass(col.value)}`
                          : `border-gray-200 ${getColorClass(col.value)} opacity-50`
                      }`}
                    >
                      {col.name}
                    </button>
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

              <div>
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
