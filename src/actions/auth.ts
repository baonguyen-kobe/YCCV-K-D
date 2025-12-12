"use server";

/**
 * Auth Server Actions
 * Handle login, logout, password reset requests
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Sign in with email/password (Local Account)
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Lỗi kết nối. Vui lòng thử lại." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/login");
}

/**
 * Request password reset
 * NOTE: Per PRD, no auto-reset flow. This just shows a message to contact Admin.
 */
export async function requestPasswordReset(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _email: string
): Promise<ActionResult> {
  // ASSUMPTION: PRD says no auto-reset, just display contact Admin message
  // This action exists for future extension if needed
  return {
    success: false,
    error:
      "Vui lòng liên hệ Admin qua email: bao.nguyen@eiu.edu.vn để được reset mật khẩu.",
  };
}
