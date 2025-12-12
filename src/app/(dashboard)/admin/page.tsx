"use client";

import { useState, useEffect } from "react";
import { UserManagement } from "@/components/admin/user-management";
import { CategoryManagement } from "@/components/admin/category-management";
import { Users, FolderTree, Loader2 } from "lucide-react";

type TabType = "users" | "categories";

interface AdminData {
  users: any[];
  roles: any[];
  units: any[];
  categories: any[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/data");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Bạn không có quyền truy cập trang này");
          } else {
            setError("Không thể tải dữ liệu");
          }
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <a href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
            Quay lại Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="h-4 w-4" />
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "categories"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            Danh mục
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "users" && data && (
          <UserManagement
            users={data.users}
            roles={data.roles}
            units={data.units}
          />
        )}
        {activeTab === "categories" && data && (
          <CategoryManagement
            categories={data.categories}
            units={data.units}
          />
        )}
      </div>
    </div>
  );
}
