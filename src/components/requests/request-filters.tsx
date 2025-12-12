"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
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
}

export function RequestFilters({ currentStatus, currentPriority }: RequestFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filtering
    params.delete("page");
    
    const queryString = params.toString();
    router.push(`/requests${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
