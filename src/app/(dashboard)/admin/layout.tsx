import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description: "Trang quản trị hệ thống",
};

const ADMIN_MENU = [
  { href: "/admin", label: "Tổng quan", icon: "📊" },
  { href: "/admin/users", label: "Người dùng", icon: "👥" },
  { href: "/admin/categories", label: "Danh mục", icon: "📁" },
  { href: "/admin/units", label: "Phòng ban", icon: "🏢" },
  { href: "/admin/roles", label: "Vai trò", icon: "👔" },
  { href: "/admin/priorities", label: "Mức ưu tiên", icon: "⚡" },
  { href: "/admin/statuses", label: "Trạng thái", icon: "📍" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1">
        <div className="sticky top-4 border rounded-lg p-4 bg-white">
          <h2 className="font-bold text-lg mb-4">Quản trị</h2>
          <nav className="space-y-1">
            {ADMIN_MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg hover:bg-blue-50 text-sm"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="lg:col-span-3">{children}</main>
    </div>
  );
}
