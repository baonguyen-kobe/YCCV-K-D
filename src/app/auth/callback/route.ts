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
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=server_error`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Whitelist check: Only allow users in users table with is_active = true
      // Per PRD Section 3.1: Only whitelisted users can login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const email = user.email.trim().toLowerCase();

        const { data: whitelistedUser, error: userError } = await supabase
          .from("users")
          .select("id, is_active, unit_id")
          .eq("email", email)
          .maybeSingle();

        // Check if user exists and is active
        if (userError || !whitelistedUser || !whitelistedUser.is_active) {
          // User not in whitelist or inactive - sign out and deny access
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=not_whitelisted`
          );
        }

        // Update user profile from Google OAuth (whitelisted users only)
        // Avoid upserting/changing primary key to prevent FK issues.
        const { error: profileError } = await supabase
          .from("users")
          .update({
            full_name:
              user.user_metadata?.full_name || email.split("@")[0],
            phone: user.phone || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", whitelistedUser.id);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }

        // Ensure user has at least the default 'user' role
        // This is a backup - the database trigger should handle this
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", whitelistedUser.id);

        if (!userRoles || userRoles.length === 0) {
          // Get the 'user' role id and assign it
          const { data: userRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "user")
            .single();

          if (userRole) {
            await supabase.from("user_roles").insert({
              user_id: whitelistedUser.id,
              role_id: userRole.id,
            });
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
