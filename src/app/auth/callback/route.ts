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
      // Whitelist check: Only allow users in users table with is_active = true
      // Per PRD Section 3.1: Only whitelisted users can login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { data: whitelistedUser, error: userError } = await supabase
          .from("users")
          .select("id, is_active, unit_id")
          .eq("email", user.email);

        // Check if user exists and is active
        if (userError || !whitelistedUser || whitelistedUser.length === 0 || !whitelistedUser[0].is_active) {
          // User not in whitelist or inactive - sign out and deny access
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=not_whitelisted`
          );
        }

        // Auto create/update user profile from Google OAuth
        const { error: profileError } = await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              phone: user.phone || "",
              unit_id: whitelistedUser[0]?.unit_id,
              is_active: true,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "email",
            }
          );

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
