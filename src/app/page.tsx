import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/demo-mode";
import { getCurrentUserWithRoles } from "@/lib/auth";

export default async function Home() {
  // In demo mode, go directly to dashboard
  if (isMockMode()) {
    redirect("/dashboard");
  }

  const user = await getCurrentUserWithRoles();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
