"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/admin";
import { toast } from "sonner";
import { User, Mail, Phone, Building, Shield, Calendar, Save } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  unit: { id: string; name: string } | null;
  roles: Role[];
}

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile: initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);
  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || "",
    phone: initialProfile.phone || "",
  });
  const [errors, setErrors] = useState({
    full_name: "",
    phone: "",
  });

  // Validation according to INPUT_FIELDS_AND_FORMATS.md
  const validateForm = () => {
    const newErrors = {
      full_name: "",
      phone: "",
    };

    // Full name: min 1, max 255 characters
    if (formData.full_name.trim().length < 1) {
      newErrors.full_name = "Họ và tên không được để trống";
    } else if (formData.full_name.length > 255) {
      newErrors.full_name = "Họ và tên không được vượt quá 255 ký tự";
    }

    // Phone: optional, max 20 chars, only numbers, spaces, +, -, ()
    if (formData.phone.trim()) {
      if (formData.phone.length > 20) {
        newErrors.phone = "Số điện thoại không được vượt quá 20 ký tự";
      } else if (!/^[0-9+\s\-()]*$/.test(formData.phone)) {
        newErrors.phone = "Số điện thoại chỉ được chứa số, dấu cách, +, -, ()";
      }
    }

    setErrors(newErrors);
    return !newErrors.full_name && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || undefined,
      });

      if (result.success) {
        // Update local profile state immediately
        setProfile({
          ...profile,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
        });
        
        toast.success("Đã cập nhật hồ sơ");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Không thể cập nhật");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Avatar Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentUrl={avatarUrl}
            userName={profile.full_name}
            userId={profile.id}
            onUploadComplete={(newUrl) => setAvatarUrl(newUrl)}
          />
          <div className="text-white">
            <h2 className="text-xl font-semibold">
              {profile.full_name || "(Chưa có tên)"}
            </h2>
            <p className="text-blue-100">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Email (readonly) */}
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="text-gray-900">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Email không thể thay đổi
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Họ và tên
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, full_name: e.target.value }));
                    setErrors((p) => ({ ...p, full_name: "" }));
                  }}
                  maxLength={255}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.full_name
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {errors.full_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">
                {profile.full_name || "(Chưa cập nhật)"}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Số điện thoại
            </label>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, phone: e.target.value }));
                    setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  maxLength={20}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  placeholder="(Chưa cập nhật)"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">
                {profile.phone || "(Chưa cập nhật)"}
              </p>
            )}
          </div>
        </div>

        {/* Unit (readonly) */}
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Đơn vị
            </label>
            <p className="text-gray-900">
              {profile.unit?.name || "(Chưa phân đơn vị)"}
            </p>
          </div>
        </div>

        {/* Roles (readonly) */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Vai trò
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <span
                  key={role.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(role.name)}`}
                >
                  {role.display_name}
                </span>
              ))}
              {profile.roles.length === 0 && (
                <span className="text-gray-500">(Chưa được gán vai trò)</span>
              )}
            </div>
          </div>
        </div>

        {/* Created At (readonly) */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Ngày tạo tài khoản
            </label>
            <p className="text-gray-900">{formatDate(profile.created_at)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile.full_name || "",
                    phone: profile.phone || "",
                  });
                  setErrors({ full_name: "", phone: "" });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
