"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50];

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  baseUrl,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (page: number, size?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    if (size) params.set("pageSize", String(size));
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePageSizeChange = (newSize: number) => {
    // Reset to page 1 when changing page size
    router.push(buildUrl(1, newSize));
  };

  // Calculate display range
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to display
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push("...");
    }
    
    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    
    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Info and page size */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Hiển thị <strong>{from}</strong>-<strong>{to}</strong> trong <strong>{totalCount}</strong> kết quả
        </span>
        
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>/ trang</span>
        </div>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <a
            href={currentPage > 1 ? buildUrl(1) : undefined}
            className={`p-1.5 rounded ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-disabled={currentPage === 1}
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </a>

          {/* Previous page */}
          <a
            href={currentPage > 1 ? buildUrl(currentPage - 1) : undefined}
            className={`p-1.5 rounded ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-disabled={currentPage === 1}
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </a>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <a
                  key={pageNum}
                  href={buildUrl(pageNum)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded text-sm ${
                    pageNum === currentPage
                      ? "bg-blue-600 text-white font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {pageNum}
                </a>
              )
            )}
          </div>

          {/* Next page */}
          <a
            href={currentPage < totalPages ? buildUrl(currentPage + 1) : undefined}
            className={`p-1.5 rounded ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-disabled={currentPage === totalPages}
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </a>

          {/* Last page */}
          <a
            href={currentPage < totalPages ? buildUrl(totalPages) : undefined}
            className={`p-1.5 rounded ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-disabled={currentPage === totalPages}
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
