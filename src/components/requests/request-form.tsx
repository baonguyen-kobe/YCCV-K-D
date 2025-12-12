"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createRequest, updateRequest, submitRequest } from "@/actions/requests";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import type { Priority } from "@/types/database.types";

// Form validation schema
const requestItemSchema = z.object({
  id: z.string().optional(),
  item_name: z.string().min(1, "Tên vật phẩm không được để trống"),
  category_id: z.string().optional().nullable(),
  unit_count: z.string().optional().nullable(),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  required_at: z.string().optional().nullable(),
  link_ref: z.string().url("Link không hợp lệ").optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
});

const requestFormSchema = z.object({
  reason: z.string().min(10, "Lý do yêu cầu phải có ít nhất 10 ký tự").max(1000, "Lý do yêu cầu không được vượt quá 1000 ký tự"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  items: z.array(requestItemSchema).min(1, "Phải có ít nhất một mục yêu cầu"),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

const PRIORITY_OPTIONS: { value: Priority; label: string; description: string }[] = [
  { value: "LOW", label: "Thấp", description: "Không gấp, có thể xử lý sau" },
  { value: "NORMAL", label: "Bình thường", description: "Thời gian xử lý tiêu chuẩn" },
  { value: "HIGH", label: "Cao", description: "Cần xử lý sớm trong vòng 1-2 ngày" },
  { value: "URGENT", label: "Khẩn cấp", description: "Cần xử lý ngay trong ngày" },
];

interface Category {
  id: string;
  name: string;
  code: string | null;
}

interface InitialData {
  id: string;
  reason: string;
  priority: Priority;
  items: {
    id?: string;
    item_name: string;
    category_id: string | null;
    unit_count: string | null;
    quantity: number;
    required_at: string | null;
    link_ref: string | null;
    notes: string | null;
  }[];
}

interface RequestFormProps {
  categories: Category[];
  mode?: "create" | "edit";
  initialData?: InitialData;
}

export function RequestForm({ categories, mode = "create", initialData }: RequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"draft" | "submit">("draft");

  const isEditMode = mode === "edit" && initialData;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: isEditMode
      ? {
          reason: initialData.reason,
          priority: initialData.priority,
          items: initialData.items.map((item) => ({
            id: item.id,
            item_name: item.item_name,
            category_id: item.category_id || "",
            unit_count: item.unit_count || "",
            quantity: item.quantity,
            required_at: item.required_at || "",
            link_ref: item.link_ref || "",
            notes: item.notes || "",
          })),
        }
      : {
          reason: "",
          priority: "NORMAL",
          items: [{ item_name: "", quantity: 1, unit_count: "", notes: "" }],
        },
  });

  const selectedPriority = watch("priority");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing request
        const updateResult = await updateRequest({
          id: initialData.id,
          reason: data.reason,
          priority: data.priority,
          items: data.items.map((item) => ({
            item_name: item.item_name,
            category_id: item.category_id || undefined,
            unit_count: item.unit_count || undefined,
            quantity: item.quantity,
            required_at: item.required_at || undefined,
            link_ref: item.link_ref || undefined,
            notes: item.notes || undefined,
          })),
        });

        if (!updateResult.success) {
          toast.error(updateResult.error || "Không thể cập nhật yêu cầu");
          setIsSubmitting(false);
          return;
        }

        // If submit action, also submit the request
        if (submitAction === "submit") {
          const submitResult = await submitRequest(initialData.id);
          if (!submitResult.success) {
            toast.error(submitResult.error || "Không thể gửi yêu cầu");
            router.push(`/requests/${initialData.id}`);
            return;
          }
          toast.success("Yêu cầu đã được gửi thành công!");
        } else {
          toast.success("Đã cập nhật yêu cầu thành công!");
        }

        router.push(`/requests/${initialData.id}`);
      } else {
        // Create new request
        const createResult = await createRequest({
          reason: data.reason,
          priority: data.priority,
          items: data.items.map((item) => ({
            item_name: item.item_name,
            category_id: item.category_id || undefined,
            unit_count: item.unit_count || undefined,
            quantity: item.quantity,
            required_at: item.required_at || undefined,
            link_ref: item.link_ref || undefined,
            notes: item.notes || undefined,
          })),
        });

        if (!createResult.success) {
          toast.error(createResult.error || "Không thể tạo yêu cầu");
          setIsSubmitting(false);
          return;
        }

        const requestId = createResult.data?.id;

        // If submit action, also submit the request
        if (submitAction === "submit" && requestId) {
          const submitResult = await submitRequest(requestId);
          if (!submitResult.success) {
            toast.error(submitResult.error || "Không thể gửi yêu cầu");
            router.push(`/requests/${requestId}`);
            return;
          }
          toast.success("Yêu cầu đã được gửi thành công!");
        } else {
          toast.success("Đã lưu bản nháp thành công!");
        }

        router.push(`/requests/${requestId}`);
      }
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={isEditMode ? `/requests/${initialData.id}` : "/requests"}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-6 w-6" />
                Chỉnh sửa Yêu cầu
              </>
            ) : (
              "Tạo Yêu cầu Công việc"
            )}
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitAction("draft")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? "Lưu thay đổi" : "Lưu nháp"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitAction("submit")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Gửi yêu cầu
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-lg border divide-y">
        {/* Reason */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do yêu cầu <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={4}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Mô tả chi tiết lý do và mục đích của yêu cầu này..."
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ ưu tiên
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRIORITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                  selectedPriority === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  {...register("priority")}
                  value={option.value}
                  className="sr-only"
                />
                <span className="flex flex-1 flex-col">
                  <span className={`block text-sm font-medium ${
                    selectedPriority === option.value ? "text-blue-700" : "text-gray-900"
                  }`}>
                    {option.label}
                  </span>
                  <span className="mt-1 flex items-center text-xs text-gray-500">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Danh sách vật phẩm/công việc <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() =>
                append({ item_name: "", quantity: 1, unit_count: "", notes: "" })
              }
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Thêm mục
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative border rounded-lg p-4 bg-gray-50"
              >
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Tên vật phẩm/công việc <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`items.${index}.item_name`)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: Găng tay y tế size M"
                    />
                    {errors.items?.[index]?.item_name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.items[index]?.item_name?.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Danh mục
                    </label>
                    <select
                      {...register(`items.${index}.category_id`)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity & Unit */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Đơn vị
                      </label>
                      <input
                        {...register(`items.${index}.unit_count`)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cái, hộp, bộ..."
                      />
                    </div>
                  </div>

                  {/* Required Date */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Ngày cần
                    </label>
                    <input
                      type="date"
                      {...register(`items.${index}.required_at`)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Link Reference */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Link tham khảo
                    </label>
                    <input
                      type="url"
                      {...register(`items.${index}.link_ref`)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    {errors.items?.[index]?.link_ref && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.items[index]?.link_ref?.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Ghi chú
                    </label>
                    <input
                      {...register(`items.${index}.notes`)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Thông tin bổ sung về mục này..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.items?.root && (
            <p className="mt-2 text-sm text-red-500">{errors.items.root.message}</p>
          )}
        </div>
      </div>

      {/* Submit Buttons (Mobile) */}
      <div className="md:hidden flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setSubmitAction("draft")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isEditMode ? "Lưu" : "Lưu nháp"}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setSubmitAction("submit")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Gửi yêu cầu
        </button>
      </div>
    </form>
  );
}
