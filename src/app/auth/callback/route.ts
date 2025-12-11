import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Handler
 * Handles OAuth redirect from Supabase (Google login)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // TODO: Check whitelist - if user email not in users table, deny access
      // Per PRD Section 3.1: Only whitelisted users can login

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
