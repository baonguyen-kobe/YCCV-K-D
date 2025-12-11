/**
 * Dashboard Page Placeholder
 * TODO: Implement dashboard widgets per PRD Section 3.8
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* TODO: Implement dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget placeholders */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Phiếu mới</div>
          <div className="text-3xl font-bold text-blue-600">-</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Đang xử lý</div>
          <div className="text-3xl font-bold text-purple-600">-</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Quá hạn</div>
          <div className="text-3xl font-bold text-red-600">-</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-500">Hoàn thành tháng này</div>
          <div className="text-3xl font-bold text-green-600">-</div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-800 text-sm">
          🚧 Dashboard đang được phát triển. Các widget sẽ được cập nhật sau khi hoàn thành DB schema.
        </p>
      </div>
    </div>
  );
}
