import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware for authentication & route protection
 * Based on PRD: Whitelist auth, route guards
 * 
 * Safety: Handles missing env variables gracefully, prevents crashes
 */
export async function middleware(request: NextRequest) {
  // Safety check: ensure required environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Skip middleware for demo mode (placeholder URL)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    console.log("[MIDDLEWARE] Demo mode detected - skipping auth check");
    // Don't crash - return normal response and let app handle it
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Do not remove this line
    // It refreshes the session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const publicRoutes = ["/login", "/auth/callback", "/unauthorized"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // API routes for cron jobs (protected by secret)
    const isCronRoute = pathname.startsWith("/api/cron");

    // If not authenticated and trying to access protected route
    if (!user && !isPublicRoute && !isCronRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // If authenticated and trying to access login page
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Admin-only routes
    const adminRoutes = ["/admin"];
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

    if (isAdminRoute && user) {
      // TODO: Check if user has admin role
      // For now, let the page-level guard handle this
      // This is a performance optimization opportunity
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[MIDDLEWARE] Error in middleware:", error);
    // Don't crash on middleware errors - return normal response
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
