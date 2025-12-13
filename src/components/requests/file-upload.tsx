"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadAttachment, deleteAttachment } from "@/actions/requests";
import { toast } from "sonner";
import { Upload, X, FileText, Image, File, Loader2 } from "lucide-react";
import { MAX_FILE_SIZE_BYTES, MAX_ATTACHMENTS_PER_REQUEST, ALLOWED_FILE_TYPES } from "@/lib/constants";

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
}

interface FileUploadProps {
  requestId?: string;
  attachments?: Attachment[];
  canEdit?: boolean;
  onUploadComplete?: (attachment: Attachment) => void;
  onDeleteComplete?: (id: string) => void;
}

export function FileUpload({
  requestId,
  attachments = [],
  canEdit = true,
  onUploadComplete,
  onDeleteComplete,
}: FileUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalFileName, setExternalFileName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File quá lớn. Tối đa ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Loại file không được hỗ trợ. Chỉ hỗ trợ: ảnh, PDF, Word, Excel");
      return;
    }

    // Check attachment limit
    if (attachments.length >= MAX_ATTACHMENTS_PER_REQUEST) {
      toast.error(`Tối đa ${MAX_ATTACHMENTS_PER_REQUEST} file đính kèm`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (requestId) {
        formData.append("requestId", requestId);
      }

      const result = await uploadAttachment(formData);

      if (result.success && result.data) {
        toast.success("Upload file thành công");
        onUploadComplete?.(result.data);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể upload file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExternalUrl = async () => {
    // Validate URL
    if (!externalUrl.trim()) {
      toast.error("Vui lòng nhập URL");
      return;
    }

    try {
      new URL(externalUrl);
    } catch {
      toast.error("URL không hợp lệ");
      return;
    }

    // Validate file name
    if (!externalFileName.trim()) {
      toast.error("Vui lòng nhập tên file");
      return;
    }

    // Check attachment limit
    if (attachments.length >= MAX_ATTACHMENTS_PER_REQUEST) {
      toast.error(`Tối đa ${MAX_ATTACHMENTS_PER_REQUEST} file đính kèm`);
      return;
    }

    setIsUploading(true);

    try {
      // Create attachment object for external URL
      const mockAttachment: Attachment = {
        id: crypto.randomUUID(),
        file_name: externalFileName,
        file_type: "external_url",
        file_size: 0,
        file_url: externalUrl,
      };

      toast.success("Đã thêm link tham khảo");
      onUploadComplete?.(mockAttachment);
      setExternalUrl("");
      setExternalFileName("");
      setUploadMode("file");
      router.refresh();
    } catch (error) {
      console.error("Error adding external URL:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Bạn có chắc muốn xoá file này?")) return;

    setDeletingId(attachmentId);

    try {
      const result = await deleteAttachment(attachmentId);

      if (result.success) {
        toast.success("Đã xoá file");
        onDeleteComplete?.(attachmentId);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể xoá file");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Có lỗi xảy ra khi xoá file");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "external_url") return <Upload className="h-5 w-5 text-green-500" />;
    if (fileType === "image") return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType === "document") return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Toggle */}
      {canEdit && attachments.length < MAX_ATTACHMENTS_PER_REQUEST && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === "file"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tải file lên
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMode === "url"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
             Nhập URL
          </button>
        </div>
      )}

      {/* Upload Mode: File */}
      {canEdit && uploadMode === "file" && attachments.length < MAX_ATTACHMENTS_PER_REQUEST && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={ALLOWED_FILE_TYPES.join(",")}
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 w-full justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Tải file lên
              </>
            )}
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Tối đa {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB. Hỗ trợ: ảnh, PDF, Word, Excel ({attachments.length}/{MAX_ATTACHMENTS_PER_REQUEST})
          </p>
        </div>
      )}

      {/* Upload Mode: URL */}
      {canEdit && uploadMode === "url" && attachments.length < MAX_ATTACHMENTS_PER_REQUEST && (
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên file <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={externalFileName}
              onChange={(e) => setExternalFileName(e.target.value)}
              placeholder="Ví dụ: Tài liệu tham khảo"
              maxLength={255}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://drive.google.com/... hoặc https://dropbox.com/..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddExternalUrl}
            disabled={isUploading || !externalUrl.trim() || !externalFileName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang thêm...
              </>
            ) : (
              "Thêm URL"
            )}
          </button>
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <a
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 flex-1 min-w-0 hover:text-blue-600"
              >
                {getFileIcon(attachment.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {attachment.file_type === "external_url" ? "Link tham khảo" : formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </a>
              
              {canEdit && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deletingId === attachment.id}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Xoá file"
                >
                  {deletingId === attachment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {attachments.length === 0 && !canEdit && (
        <p className="text-sm text-gray-500">Không có file đính kèm</p>
      )}
    </div>
  );
}
