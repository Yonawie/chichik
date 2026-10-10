import { cookies } from "next/headers";
import { AppSidebar } from "@/components/AppSidebar";
import { PetProvider } from "@/components/PetProvider";
import { parseGate, GATE_COOKIE } from "@/lib/auth/gate";
import { getProfile, getSessionUser } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false;
  let userId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const jar = await cookies();
      const gate = parseGate(jar.get(GATE_COOKIE)?.value);
      const { user } = await getSessionUser();
      userId = user?.id ?? null;
      if (gate) {
        isAdmin = gate.role === "admin";
      } else {
        const profile = await getProfile();
        isAdmin = profile?.role === "admin";
        userId = profile?.id ?? userId;
      }
    } catch {
      isAdmin = false;
    }
  }

  return (
    <PetProvider userId={userId}>
      <div className="flex min-h-full flex-col lg:flex-row">
        <AppSidebar isAdmin={isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </PetProvider>
  );
}
