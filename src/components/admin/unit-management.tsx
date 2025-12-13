"use client";

import { useState } from "react";
import { upsertUnit, deleteUnit } from "@/actions/admin";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
}

interface UnitManagementProps {
  units: Unit[];
}

export function UnitManagement({ units: initialUnits }: UnitManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUnit(null);
    setFormData({ name: "", code: "", description: "", is_active: true });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      code: unit.code || "",
      description: unit.description || "",
      is_active: unit.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên phòng ban bắt buộc";
    } else if (formData.name.length > 255) {
      newErrors.name = "Tên tối đa 255 ký tự";
    }
    if (formData.code && formData.code.length > 50) {
      newErrors.code = "Mã tối đa 50 ký tự";
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Mô tả tối đa 500 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await upsertUnit({
        id: editingUnit?.id,
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });

      if (result.success) {
        if (editingUnit) {
          setUnits(units.map((u) => (u.id === editingUnit.id ? { ...u, ...formData } : u)));
          toast.success("Đã cập nhật phòng ban");
        } else {
          const newUnit = { ...formData, id: result.data?.id || "" } as Unit;
          setUnits([newUnit, ...units]);
          toast.success("Đã tạo phòng ban");
        }
        setShowModal(false);
      } else {
        toast.error(result.error || "Lỗi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (unitId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    try {
      const result = await deleteUnit(unitId);
      if (result.success) {
        setUnits(units.filter((u) => u.id !== unitId));
        toast.success("Đã xóa phòng ban");
      } else {
        toast.error(result.error || "Lỗi");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quản lý Phòng ban</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm phòng ban
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Mã</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUnits.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Không có phòng ban
                </td>
              </tr>
            ) : (
              filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{unit.name}</td>
                  <td className="px-6 py-3 text-gray-600">{unit.code || "-"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        unit.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {unit.is_active ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(unit)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
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
                {editingUnit ? "Chỉnh sửa" : "Thêm"} phòng ban
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
                <label className="block text-sm font-medium mb-1">Mã</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.code ? "border-red-500" : ""
                  }`}
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
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
