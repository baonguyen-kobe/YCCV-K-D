"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createRequest, submitRequest } from "@/actions/requests";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Priority } from "@/types/database.types";
import { MAX_REASON_LENGTH } from "@/lib/constants";

// Form validation schema - synced with backend validation
const requestItemSchema = z.object({
  item_name: z.string().min(1, "Tên vật phẩm không được để trống").max(500, "Tên vật phẩm tối đa 500 ký tự"),
  category_id: z.string().optional(),
  unit_count: z.string().optional(),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  required_at: z.string().optional(),
  link_ref: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
  notes: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

const requestFormSchema = z.object({
  reason: z.string().min(10, "Lý do yêu cầu phải có ít nhất 10 ký tự").max(MAX_REASON_LENGTH, `Lý do yêu cầu tối đa ${MAX_REASON_LENGTH} ký tự`),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  items: z.array(requestItemSchema).min(1, "Phải có ít nhất một mục yêu cầu").max(50, "Tối đa 50 hạng mục"),
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

interface CreateRequestFormProps {
  categories: Category[];
}

export function CreateRequestForm({ categories }: CreateRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"draft" | "submit">("draft");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      reason: "",
      priority: "NORMAL",
      items: [{ item_name: "", quantity: 1, unit_count: "", notes: "" }],
    },
  });

  const reasonValue = watch("reason");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create the request
      const createResult = await createRequest({
        reason: data.reason,
        priority: data.priority,
        items: data.items,
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
          // Still redirect to edit page since draft was created
          router.push(`/requests/${requestId}`);
          return;
        }
        toast.success("Yêu cầu đã được gửi thành công!");
      } else {
        toast.success("Đã lưu bản nháp thành công!");
      }

      router.push(`/requests/${requestId}`);
    } catch (error) {
      console.error("Error creating request:", error);
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
            href="/requests"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Tạo Yêu cầu Công việc</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitAction("draft")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Lưu nháp
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
            maxLength={MAX_REASON_LENGTH}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Mô tả chi tiết lý do và mục đích của yêu cầu này..."
          />
          <div className="flex justify-between mt-1">
            {errors.reason ? (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${(reasonValue?.length || 0) > MAX_REASON_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {reasonValue?.length || 0}/{MAX_REASON_LENGTH}
            </span>
          </div>
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
                className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
              >
                <input
                  type="radio"
                  {...register("priority")}
                  value={option.value}
                  className="sr-only"
                />
                <span className="flex flex-1 flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="mt-1 flex items-center text-xs text-gray-500">
                    {option.description}
                  </span>
                </span>
                <span
                  className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-blue-600"
                  aria-hidden="true"
                />
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
          Lưu nháp
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
