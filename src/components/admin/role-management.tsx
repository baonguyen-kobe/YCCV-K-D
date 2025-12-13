"use client";

import { useState } from "react";
import { upsertRole, deleteRole } from "@/actions/admin";
import { toast } from "sonner";
import { Edit2, Trash2, X } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
  { id: "view_requests", label: "Xem yêu cầu" },
  { id: "create_requests", label: "Tạo yêu cầu" },
  { id: "edit_own_requests", label: "Chỉnh sửa yêu cầu của mình" },
  { id: "edit_all_requests", label: "Chỉnh sửa toàn bộ yêu cầu" },
  { id: "delete_own_requests", label: "Xóa yêu cầu của mình" },
  { id: "delete_all_requests", label: "Xóa toàn bộ yêu cầu" },
  { id: "manage_users", label: "Quản lý người dùng" },
  { id: "manage_categories", label: "Quản lý danh mục" },
  { id: "manage_units", label: "Quản lý phòng ban" },
  { id: "manage_roles", label: "Quản lý vai trò" },
  { id: "view_reports", label: "Xem báo cáo" },
  { id: "export_data", label: "Xuất dữ liệu" },
];

const PREDEFINED_ROLES = [
  {
    name: "admin",
    description: "Quản trị viên - toàn quyền",
    permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
  },
  {
    name: "manager",
    description: "Quản lý - quản lý yêu cầu",
    permissions: [
      "view_requests",
      "create_requests",
      "edit_all_requests",
      "delete_own_requests",
      "view_reports",
    ],
  },
  {
    name: "staff",
    description: "Nhân viên - tạo và quản lý yêu cầu của mình",
    permissions: ["view_requests", "create_requests", "edit_own_requests", "delete_own_requests"],
  },
];

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_active: boolean;
}

interface RoleManagementProps {
  roles: Role[];
}

export function RoleManagement({ roles: initialRoles }: RoleManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState(initialRoles);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [], is_active: true });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: [...role.permissions],
      is_active: role.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const applyTemplate = (template: (typeof PREDEFINED_ROLES)[0]) => {
    setFormData((p) => ({
      ...p,
      name: template.name,
      description: template.description,
      permissions: [...template.permissions],
    }));
  };

  const togglePermission = (permId: string) => {
    setFormData((p) => ({
      ...p,
      permissions: p.permissions.includes(permId)
        ? p.permissions.filter((x) => x !== permId)
        : [...p.permissions, permId],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên vai trò bắt buộc";
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = "Tên phải là chữ cái, số, dấu gạch dưới";
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = "Chọn ít nhất 1 quyền";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await upsertRole({
        id: editingRole?.id,
        name: formData.name.toLowerCase().trim(),
        description: formData.description.trim() || undefined,
        permissions: formData.permissions,
        is_active: formData.is_active,
      });

      if (result.success) {
        if (editingRole) {
          setRoles(roles.map((r) => (r.id === editingRole.id ? { ...r, ...formData } : r)));
          toast.success("Đã cập nhật vai trò");
        } else {
          const newRole = { ...formData, id: result.data?.id || "" } as Role;
          setRoles([...roles, newRole]);
          toast.success("Đã tạo vai trò");
        }
        setShowModal(false);
      } else {
        toast.error(result.error || "Lỗi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa vai trò này?")) return;

    try {
      const result = await deleteRole(roleId);
      if (result.success) {
        setRoles(roles.filter((r) => r.id !== roleId));
        toast.success("Đã xóa vai trò");
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
        <h2 className="text-xl font-semibold">Quản lý Vai trò</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Thêm vai trò
        </button>
      </div>

      <div className="grid gap-4">
        {roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có vai trò</div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm) => {
                  const label = AVAILABLE_PERMISSIONS.find((p) => p.id === perm)?.label;
                  return (
                    <span
                      key={perm}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {role.is_active ? "✓ Hoạt động" : "✗ Ngừng"}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">{editingRole ? "Chỉnh sửa" : "Thêm"} vai trò</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!editingRole && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-2">Mẫu nhanh:</p>
                  <div className="flex gap-2 flex-wrap">
                    {PREDEFINED_ROLES.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                      >
                        {template.description}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Tên vai trò *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  required
                  disabled={!!editingRole}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                <label className="block text-sm font-medium mb-3">Quyền *</label>
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
                {errors.permissions && (
                  <p className="text-xs text-red-500 mt-1">{errors.permissions}</p>
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

              <div className="flex justify-end gap-2 pt-4 border-t">
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
