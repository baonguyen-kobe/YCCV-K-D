import { createClient } from "@/lib/supabase/server";
import { requireAuthWithRoles } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";

/**
 * Profile Page
 * User can view and edit their own profile
 */
export default async function ProfilePage() {
  const user = await requireAuthWithRoles();
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Failed to create Supabase client");
  }

  // Fetch full user profile
  const { data: profile } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone,
      avatar_url,
      created_at,
      unit:units (id, name),
      user_roles (
        role:roles (id, name, display_name)
      )
    `)
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unitData = profile?.unit as any;
  const unit = Array.isArray(unitData) ? unitData[0] : unitData;

  const roles = (profile?.user_roles || []).map((ur: { role: { id: string; name: string; display_name: string } | { id: string; name: string; display_name: string }[] | null }) => {
    const role = Array.isArray(ur.role) ? ur.role[0] : ur.role;
    return role ? { id: role.id, name: role.name, display_name: role.display_name } : null;
  }).filter(Boolean) as { id: string; name: string; display_name: string }[];

  const profileData = {
    id: profile?.id || user.id,
    email: profile?.email || user.email || "",
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    avatar_url: profile?.avatar_url || "",
    created_at: profile?.created_at || "",
    unit: unit ? { id: unit.id, name: unit.name } : null,
    roles,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
      <ProfileForm profile={profileData} />
    </div>
  );
}
