/**
 * Demo Mode Utilities
 *
 * Check if app is running in demo mode (without real Supabase connection)
 * Reference: baonguyen-kobe/eiumed-equipment pattern
 */

/**
 * Check if running in demo mode
 * Demo mode is active when:
 * 1. Supabase URL is not set
 * 2. Supabase URL contains "placeholder"
 * 3. Running on server without proper env
 */
export function isMockMode(): boolean {
  // Server-side: check env directly
  if (typeof window === "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !url || url.includes("placeholder") || url === "";
  }

  // Client-side: check env
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes("placeholder") || url === "";
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !isMockMode();
}

/**
 * Get appropriate error message based on mode
 */
export function getModeAwareError(realError: string, mockError?: string): string {
  if (isMockMode()) {
    return mockError || "Demo mode: Dữ liệu chỉ mang tính minh họa";
  }
  return realError;
}

/**
 * Log helper that includes mode context
 */
export function logWithMode(message: string, data?: unknown): void {
  const prefix = isMockMode() ? "[DEMO]" : "[PROD]";
  console.log(`${prefix} ${message}`, data || "");
}
