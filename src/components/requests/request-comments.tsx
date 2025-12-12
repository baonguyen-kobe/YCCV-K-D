"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/actions/requests";
import { toast } from "sonner";
import { Send, Lock } from "lucide-react";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";

interface Comment {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | { id: string; full_name: string | null; email: string; avatar_url: string | null }[] | null;
}

interface RequestCommentsProps {
  requestId: string;
  comments: Comment[];
  canComment: boolean;
  canCreateInternal: boolean;
}

export function RequestComments({
  requestId,
  comments,
  canComment,
  canCreateInternal,
}: RequestCommentsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get first item from potential array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFirst = <T,>(value: T | T[] | null): T | null => {
    if (Array.isArray(value)) return value[0] || null;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addComment(requestId, content.trim(), isInternal);
      
      if (result.success) {
        toast.success("Đã thêm bình luận");
        setContent("");
        setIsInternal(false);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể thêm bình luận");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN");
  };

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {canComment && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canCreateInternal && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Lock className="h-4 w-4" />
                  Nội bộ
                </label>
              )}
              <span className={`text-xs ${content.length > MAX_COMMENT_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                {content.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Gửi
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">Chưa có bình luận nào</p>
      ) : (
        <div className="space-y-4 pt-4 border-t">
          {sortedComments.map((comment) => {
            const user = getFirst(comment.user);
            return (
              <div
                key={comment.id}
                className={`p-3 rounded-lg ${
                  comment.is_internal ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                    {user?.full_name?.[0] || user?.email?.[0] || "?"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {user?.full_name || user?.email || "Unknown"}
                      </span>
                      {comment.is_internal && (
                        <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                          <Lock className="h-3 w-3" />
                          Nội bộ
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
