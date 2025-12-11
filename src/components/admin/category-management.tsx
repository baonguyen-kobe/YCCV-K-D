"use client";

import { useState } from "react";
import { upsertCategory, deleteCategory } from "@/actions/admin";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FolderTree, X, ChevronRight } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  code: string | null;
}

interface Category {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  unit: { id: string; name: string } | null;
}

interface CategoryManagementProps {
  categories: Category[];
  units: Unit[];
}

export function CategoryManagement({ categories, units }: CategoryManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parent_id: "",
    unit_id: "",
    is_active: true,
    sort_order: 0,
  });

  // Get parent categories (categories without parent)
  const parentCategories = categories.filter((c) => !c.parent_id);
  
  // Build tree structure
  const getCategoryTree = () => {
    const tree: (Category & { children: Category[] })[] = [];
    
    parentCategories.forEach((parent) => {
      const children = categories.filter((c) => c.parent_id === parent.id);
      tree.push({ ...parent, children });
    });
    
    return tree;
  };

  const categoryTree = getCategoryTree();

  const openCreateModal = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      parent_id: parentId || "",
      unit_id: "",
      is_active: true,
      sort_order: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code || "",
      description: category.description || "",
      parent_id: category.parent_id || "",
      unit_id: category.unit?.id || "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await upsertCategory({
        id: editingCategory?.id,
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        parent_id: formData.parent_id || null,
        unit_id: formData.unit_id || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      });

      if (result.success) {
        toast.success(editingCategory ? "Đã cập nhật danh mục" : "Đã tạo danh mục mới");
        setShowModal(false);
      } else {
        toast.error(result.error || "Không thể lưu danh mục");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    const result = await deleteCategory(category.id);
    if (result.success) {
      toast.success("Đã xóa danh mục");
    } else {
      toast.error(result.error || "Không thể xóa danh mục");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Categories Tree */}
      <div className="bg-white rounded-lg border divide-y">
        {categoryTree.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có danh mục nào. Bấm &quot;Thêm danh mục&quot; để tạo mới.
          </div>
        ) : (
          categoryTree.map((parent) => (
            <div key={parent.id} className="divide-y">
              {/* Parent Category */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${parent.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  <div>
                    <p className="font-medium">{parent.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {parent.code && <span className="font-mono">{parent.code}</span>}
                      {parent.unit && (
                        <>
                          <span>•</span>
                          <span>{parent.unit.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreateModal(parent.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Thêm danh mục con"
                  >
                    <Plus className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => openEditModal(parent)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(parent)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Child Categories */}
              {parent.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 pl-12 hover:bg-gray-50 bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <div className={`w-2 h-2 rounded-full ${child.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                    <div>
                      <p className="font-medium text-gray-700">{child.name}</p>
                      {child.code && (
                        <p className="text-sm text-gray-500 font-mono">{child.code}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(child)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(child)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã (Code)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="VD: MEDICAL_SUPPLIES"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục cha
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData((p) => ({ ...p, parent_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Không có (Danh mục gốc) --</option>
                  {parentCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị áp dụng
                </label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData((p) => ({ ...p, unit_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Tất cả đơn vị --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Đang hoạt động
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : editingCategory ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
