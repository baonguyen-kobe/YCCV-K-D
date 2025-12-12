import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { UserForPermission } from "@/lib/permissions";
import { isMockMode } from "@/lib/demo-mode";
import { getMockCurrentUser } from "@/data/mock-data";

/**
 * Extended user type with roles and profile info
 * Compatible with UserForPermission for permission checks
 */
export type UserWithRoles = User & UserForPermission & {
  fullName: string | null;
  email: string;
};

/**
 * Get current authenticated user from Supabase Auth
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  console.log("[AUTH] Checking current user (v2.2 - Deployment Verification)");
  if (isMockMode()) {
    // Return mock user in demo mode
    const mockUser = getMockCurrentUser();
    return {
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: {},
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current user with roles from database
 * Returns user with roles array, compatible with permission checks
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  if (isMockMode()) {
    // Return mock user with roles in demo mode
    const mockUser = getMockCurrentUser();
    return {
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: {},
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      roles: mockUser.roles,
      unitId: mockUser.unit_id,
      fullName: mockUser.full_name,
    } as unknown as UserWithRoles;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user profile with roles from database
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      full_name,
      unit_id,
      user_roles (
        role:roles (
          name
        )
      )
    `
    )
    .eq("id", user.id)
    .single();

  // Always log for debugging (not just development)
  console.log('[AUTH] Profile query result:', { 
    hasProfile: !!profile,
    profileError,
    userId: user.id,
    email: user.email
  });

  if (!profile) {
    // User exists in auth but not in users table - auto-create
    console.warn('[AUTH] User not found in users table, attempting auto-create:', {
      userId: user.id,
      email: user.email,
      error: profileError
    });

    // Try to create user profile automatically
    const { data: newProfile, error: createError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        is_active: true,
      })
      .select("id, email, full_name, unit_id")
      .single();

    if (createError) {
      console.error('[AUTH] Failed to auto-create user:', createError);
      return {
        ...user,
        roles: [],
        unitId: null,
        fullName: null,
        email: user.email || "",
      };
    }

    // Assign default 'user' role
    const { data: userRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "user")
      .single();

    if (userRole) {
      await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role_id: userRole.id })
        .select();
    }

    console.log('[AUTH] User auto-created successfully:', newProfile);
    
    return {
      ...user,
      roles: ["user"], // Default role
      unitId: newProfile?.unit_id || null,
      fullName: newProfile?.full_name || null,
      email: newProfile?.email || user.email || "",
    };
  }

  // Extract role names from nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = (profile.user_roles as any[])?.map((ur) => ur.role?.name).filter(Boolean) || [];

  // Always log roles for debugging
  console.log('[AUTH] User roles loaded:', { 
    email: profile.email, 
    roles, 
    unitId: profile.unit_id,
    raw_user_roles: profile.user_roles,
    roles_count: roles.length
  });

  return {
    ...user,
    roles,
    unitId: profile.unit_id,
    fullName: profile.full_name,
    email: profile.email,
  };
}

/**
 * Convert UserWithRoles to UserForPermission
 * Use this when passing to permission check functions
 */
export function toUserForPermission(user: UserWithRoles): UserForPermission {
  return {
    id: user.id,
    roles: user.roles,
    unitId: user.unitId,
  };
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require user with roles - redirects to login if not authenticated
 */
export async function requireAuthWithRoles(): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific role(s) - redirects if user doesn't have required role
 */
export async function requireRole(requiredRoles: string[]): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

  if (!hasRequiredRole) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Require Admin role
 */
export async function requireAdmin(): Promise<UserWithRoles> {
  return requireRole(["admin"]);
}

/**
 * Require Manager or Admin role
 */
export async function requireManager(): Promise<UserWithRoles> {
  return requireRole(["admin", "manager"]);
}

// ============================================================
// RE-EXPORT permission helpers for convenience
// ============================================================
export {
  hasRole,
  hasAnyRole,
  isAdmin,
  isManager,
  isStaff,
  isUser,
  isInternalUser,
} from "@/lib/permissions";
