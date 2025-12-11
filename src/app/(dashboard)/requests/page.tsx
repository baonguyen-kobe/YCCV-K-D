import Link from "next/link";

/**
 * Requests List Page Placeholder
 * TODO: Implement request list with filter, sort, search
 */
export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách Yêu cầu</h1>
        <Link
          href="/requests/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Tạo yêu cầu
        </Link>
      </div>

      {/* TODO: Implement filters */}
      <div className="bg-white p-4 rounded-lg border">
        <p className="text-gray-500 text-sm">
          🔍 Bộ lọc: Trạng thái, Ưu tiên, Người tạo, Khoảng ngày...
        </p>
      </div>

      {/* TODO: Implement request table/cards */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-800 text-sm">
          🚧 Danh sách yêu cầu đang được phát triển.
        </p>
      </div>
    </div>
  );
}
