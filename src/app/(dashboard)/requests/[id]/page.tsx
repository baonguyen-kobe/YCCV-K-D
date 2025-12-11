import Link from "next/link";

/**
 * Request Detail Page Placeholder
 * TODO: Implement request detail view per PRD Section 3.4.4
 */
export default function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/requests" className="text-gray-500 hover:text-gray-700">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết Yêu cầu #{params.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Thông tin yêu cầu</h2>
            {/* TODO: Request info */}
            <p className="text-gray-500">🚧 Đang phát triển...</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Danh sách hạng mục</h2>
            {/* TODO: Request items table */}
            <p className="text-gray-500">🚧 Đang phát triển...</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Trao đổi</h2>
            {/* TODO: Comments section */}
            <p className="text-gray-500">🚧 Đang phát triển...</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Hành động</h2>
            {/* TODO: Action buttons based on permissions */}
            <p className="text-gray-500">🚧 Đang phát triển...</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="font-semibold mb-4">Lịch sử hoạt động</h2>
            {/* TODO: Activity log */}
            <p className="text-gray-500">🚧 Đang phát triển...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
