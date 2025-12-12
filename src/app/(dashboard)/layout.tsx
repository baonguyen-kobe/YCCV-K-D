import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserWithRoles } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { HeaderNav } from "@/components/layout/header-nav";

/**
 * Dashboard Layout - Main app layout with navigation
 * For authenticated users
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user with roles to check admin status
  const user = await getCurrentUserWithRoles();
  const showAdmin = user ? isAdmin({ id: user.id, roles: user.roles, unitId: user.unitId }) : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-lg hover:text-blue-600">
            Hệ thống YCCV
          </Link>
          
          {/* Navigation */}
          <HeaderNav showAdmin={showAdmin} userEmail={user?.email || ""} userName={user?.fullName || ""} />
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
