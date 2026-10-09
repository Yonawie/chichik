import { cache } from "react";
import { parseAdminEmails } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string | null;
  role: "student" | "admin";
  onboarding_completed: boolean;
};

export type SessionUser = { id: string; email?: string };

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user: SessionUser | null = claims?.sub
    ? { id: claims.sub, email: claims.email as string | undefined }
    : null;
  return { supabase, user };
});

export async function syncAdminRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const emails = parseAdminEmails();
  if (emails.length === 0) return;
  await supabase.rpc("ensure_admin_role", { allowed_emails: emails });
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
});

export async function requireUser() {
  const { supabase, user } = await getSessionUser();
  if (!user) return { supabase, user: null, profile: null };
  const profile = await getProfile();
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (!result.user || result.profile?.role !== "admin") {
    return { ...result, ok: false as const };
  }
  return { ...result, ok: true as const };
}
