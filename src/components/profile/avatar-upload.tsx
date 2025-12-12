"use client";

import React, { useState, useRef } from "react";
import { User, Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploadProps {
  currentUrl: string | null;
  userName: string | null;
  userId: string;
  onUploadComplete?: (newUrl: string) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function AvatarUpload({
  currentUrl,
  userName,
  userId,
  onUploadComplete,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn. Tối đa 2MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Không thể tải file lên");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Không thể cập nhật hồ sơ");
      }

      toast.success("Đã cập nhật ảnh đại diện");
      onUploadComplete?.(publicUrl);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể tải ảnh lên"
      );
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="relative group">
      {/* Avatar Display */}
      <div
        onClick={handleClick}
        className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center cursor-pointer overflow-hidden ring-2 ring-white/30 hover:ring-white/50 transition-all"
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={userName || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-white" />
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Clear preview button */}
      {preview && !isUploading && (
        <button
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            clearPreview();
          }}
          className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload hint */}
      <p className="text-xs text-blue-100 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        Nhấn để đổi ảnh
      </p>
    </div>
  );
}
