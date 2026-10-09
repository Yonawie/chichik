import { SiteAdminPanel } from "@/components/admin/SiteAdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSitePage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("site_content").select("key, value_text").order("key");

  return (
    <AdminShell title="Тексты лендинга" description="Ключ → текст. Нажмите «Изменить» у записи в списке.">
      <SiteAdminPanel rows={rows ?? []} />
    </AdminShell>
  );
}
