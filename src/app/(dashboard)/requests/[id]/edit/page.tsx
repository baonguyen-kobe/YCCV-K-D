"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequestForm } from "@/components/requests/request-form";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface RequestData {
  id: string;
  reason: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: string;
  items: {
    id: string;
    item_name: string;
    category_id: string | null;
    unit_count: string | null;
    quantity: number;
    required_at: string | null;
    link_ref: string | null;
    notes: string | null;
  }[];
}

interface Category {
  id: string;
  name: string;
  code: string | null;
}

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      if (!supabase) {
        setError("Không thể kết nối đến server");
        setLoading(false);
        return;
      }
      const requestId = params.id as string;

      // Fetch request with items
      const { data: request, error: requestError } = await supabase
        .from("requests")
        .select(`
          id,
          reason,
          priority,
          status,
          created_by,
          request_items (
            id,
            item_name,
            category_id,
            unit_count,
            quantity,
            required_at,
            link_ref,
            notes
          )
        `)
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        setError("Không tìm thấy yêu cầu");
        setLoading(false);
        return;
      }

      // Check if request is in DRAFT status
      if (request.status !== "DRAFT") {
        toast.error("Chỉ có thể chỉnh sửa yêu cầu ở trạng thái Nháp");
        router.push(`/requests/${requestId}`);
        return;
      }

      // Check if current user is the creator
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== request.created_by) {
        // Also allow admin to edit - check roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role:roles(name)")
          .eq("user_id", user?.id || "");
        
        const roleNames = roles?.map((r: { role: { name: string } | { name: string }[] | null }) => {
          if (Array.isArray(r.role)) return r.role[0]?.name;
          return r.role?.name;
        }).filter(Boolean) || [];

        if (!roleNames.includes("admin")) {
          toast.error("Bạn không có quyền chỉnh sửa yêu cầu này");
          router.push(`/requests/${requestId}`);
          return;
        }
      }

      setRequestData({
        id: request.id,
        reason: request.reason,
        priority: request.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
        status: request.status,
        items: request.request_items || [],
      });

      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, code")
        .eq("is_active", true)
        .order("sort_order");

      setCategories(cats || []);
      setLoading(false);
    }

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {error || "Không thể tải dữ liệu"}
          </h2>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RequestForm
        categories={categories}
        mode="edit"
        initialData={requestData}
      />
    </div>
  );
}
