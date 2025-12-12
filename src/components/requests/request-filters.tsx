"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Calendar, X } from "lucide-react";
import type { RequestStatus, Priority } from "@/types/database.types";

// Status filter options
const STATUS_OPTIONS: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "NEW", label: "Mới" },
  { value: "ASSIGNED", label: "Đã phân công" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "NEED_INFO", label: "Cần bổ sung" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

// Priority filter options
const PRIORITY_OPTIONS: { value: Priority | "all"; label: string }[] = [
  { value: "all", label: "Tất cả độ ưu tiên" },
  { value: "LOW", label: "Thấp" },
  { value: "NORMAL", label: "Bình thường" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn cấp" },
];

interface RequestFiltersProps {
  currentStatus: string;
  currentPriority: string;
  dateFrom?: string;
  dateTo?: string;
  showAdvanced?: boolean;
}

export function RequestFilters({ 
  currentStatus, 
  currentPriority, 
  dateFrom = "",
  dateTo = "",
  showAdvanced = false,
}: RequestFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filtering
    params.delete("page");
    
    const queryString = params.toString();
    router.push(`/requests${queryString ? `?${queryString}` : ""}`);
  };

  const clearAllFilters = () => {
    router.push("/requests");
  };

  const hasActiveFilters = currentStatus !== "all" || currentPriority !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        
        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={currentPriority}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Date Range Filters */}
        {showAdvanced && (
          <>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Từ ngày"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Đến ngày"
              />
            </div>
          </>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Xoá bộ lọc"
          >
            <X className="h-4 w-4" />
            Xoá lọc
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Trạng thái: {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
              <button 
                onClick={() => updateFilter("status", "all")}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentPriority !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Ưu tiên: {PRIORITY_OPTIONS.find(p => p.value === currentPriority)?.label}
              <button 
                onClick={() => updateFilter("priority", "all")}
                className="hover:text-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Từ: {dateFrom}
              <button 
                onClick={() => updateFilter("dateFrom", "")}
                className="hover:text-green-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Đến: {dateTo}
              <button 
                onClick={() => updateFilter("dateTo", "")}
                className="hover:text-green-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
