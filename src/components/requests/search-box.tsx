"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { searchRequests } from "@/actions/requests";
import type { RequestStatus, Priority } from "@/types/database.types";

interface SearchResult {
  id: string;
  request_number: number;
  reason: string;
  priority: Priority;
  status: RequestStatus;
  created_at: string;
  creator_name: string | null;
  matched_items: string[] | null;
}

interface SearchBoxProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showResults?: boolean;
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  DRAFT: "Nháp",
  NEW: "Mới",
  ASSIGNED: "Đã phân công",
  IN_PROGRESS: "Đang xử lý",
  NEED_INFO: "Cần bổ sung",
  DONE: "Hoàn thành",
  CANCELLED: "Đã huỷ",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  NEED_INFO: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export function SearchBox({ initialQuery = "", onSearch, showResults = true }: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get("search") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!showResults) return;
    
    const doSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const result = await searchRequests({
          query: debouncedQuery,
          pageSize: 5,
        });

        if (result.success && result.data) {
          setResults(result.data.requests);
          setTotalCount(result.data.totalCount);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    doSearch();
  }, [debouncedQuery, showResults]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to requests page with search param
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/requests?${params.toString()}`);
    }
    setShowDropdown(false);
  }, [query, onSearch, router, searchParams]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    if (onSearch) {
      onSearch("");
    }
  };

  const handleResultClick = (id: string) => {
    setShowDropdown(false);
    router.push(`/requests/${id}`);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Tìm theo mã, nội dung, vật phẩm..."
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isSearching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b">
            Tìm thấy {totalCount} kết quả
          </div>
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result.id)}
              className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">
                  #{result.request_number}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[result.status]}`}>
                  {STATUS_LABELS[result.status]}
                </span>
              </div>
              <p className="text-sm text-gray-900 line-clamp-2">
                {highlightMatch(result.reason, debouncedQuery)}
              </p>
              {result.matched_items && result.matched_items.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.matched_items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                      {highlightMatch(item, debouncedQuery)}
                    </span>
                  ))}
                  {result.matched_items.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{result.matched_items.length - 3} more
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {result.creator_name || "Unknown"} • {new Date(result.created_at).toLocaleDateString("vi-VN")}
              </p>
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full p-2 text-sm text-blue-600 hover:bg-blue-50 border-t"
          >
            Xem tất cả kết quả →
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
