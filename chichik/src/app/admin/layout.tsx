import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const { ok } = await requireAdmin();
  if (!ok) {
    redirect("/app");
  }

  return children;
}
