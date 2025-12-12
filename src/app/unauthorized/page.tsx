/**
 * Unauthorized Page
 * Shown when user doesn't have permission to access a resource
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 max-w-md">
          Bạn không có quyền truy cập trang này. 
          Vui lòng liên hệ Admin nếu bạn cho rằng đây là lỗi.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Về Dashboard
        </a>
      </div>
    </div>
  );
}
