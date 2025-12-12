/**
 * Rate Limiting Helper
 * Server-side rate limiting for API actions (per PRD Section 3.2)
 */

import { createClient } from "@/lib/supabase/server";

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  resetAt?: Date;
  error?: string;
}

/**
 * Check rate limit for user action
 * Uses database-backed counting for reliability across instances
 * Default: 5 requests per minute per user per action (PRD requirement)
 * 
 * @param userId - User ID to rate limit
 * @param action - Action name (e.g., 'create_request', 'submit_request', 'add_comment')
 * @param limit - Max requests allowed per window (default: 5)
 * @param windowMinutes - Time window in minutes (default: 1)
 * @returns {RateLimitResult} - {allowed, currentCount, resetAt, error?}
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number = 5,
  windowMinutes: number = 1
): Promise<RateLimitResult> {
  try {
    const supabase = await createClient();

    // Call the RPC function to check and increment rate limit
    const { data, error } = await supabase.rpc(
      "check_and_increment_rate_limit",
      {
        p_user_id: userId,
        p_action: action,
        p_limit: limit,
        p_window_minutes: windowMinutes,
      }
    );

    if (error) {
      console.error("[RATE_LIMIT] Error checking rate limit:", error);
      // On error, be lenient and allow the request (graceful degradation)
      return {
        allowed: true,
        currentCount: 0,
        error: "Rate limit check failed",
      };
    }

    if (!data || data.length === 0) {
      return {
        allowed: true,
        currentCount: 0,
        error: "No rate limit response",
      };
    }

    const result = data[0];
    return {
      allowed: result.allowed,
      currentCount: result.current_count,
      resetAt: result.reset_at ? new Date(result.reset_at) : undefined,
    };
  } catch (error) {
    console.error("[RATE_LIMIT] Unexpected error:", error);
    // Graceful degradation: allow request if rate limit check fails
    return {
      allowed: true,
      currentCount: 0,
      error: "Rate limit unavailable",
    };
  }
}

/**
 * Format rate limit error message for UI
 */
export function formatRateLimitError(resetAt: Date | undefined): string {
  if (!resetAt) {
    return "Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.";
  }

  const now = new Date();
  const secondsUntilReset = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

  if (secondsUntilReset <= 0) {
    return "Vui lòng thử lại ngay.";
  }

  return `Vui lòng chờ ${secondsUntilReset} giây rồi thử lại.`;
}
