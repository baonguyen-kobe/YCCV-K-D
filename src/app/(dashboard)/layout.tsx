import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

/**
 * Dashboard Layout - Main app layout with navigation
 * For authenticated users
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - TODO: Implement full header with user menu */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg">
            Hệ thống YCCV
          </div>
          
          {/* TODO: Add navigation and user menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/requests" className="text-gray-600 hover:text-gray-900">
              Yêu cầu
            </Link>
          </nav>

          {/* Mobile menu button placeholder */}
          <button className="md:hidden p-2">
            <span className="sr-only">Menu</span>
            ☰
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
