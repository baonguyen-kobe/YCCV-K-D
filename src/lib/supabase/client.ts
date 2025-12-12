import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components
 * Use this in 'use client' components
 * 
 * Safety: Validates environment variables before creating client
 * Note: In browser, env vars are already validated at build time
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  // Demo mode check: return null if placeholder
  if (supabaseUrl.includes("placeholder")) {
    console.log("[SUPABASE] Demo mode - returning null client");
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
