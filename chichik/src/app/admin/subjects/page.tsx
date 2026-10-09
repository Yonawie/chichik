import { SubjectsAdminPanel } from "@/components/admin/SubjectsAdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSubjectsPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("code, title, short_description, emoji, sort_order")
    .order("sort_order");

  return (
    <AdminShell title="Предметы" description="Код предмета после создания лучше не менять.">
      <SubjectsAdminPanel subjects={subjects ?? []} />
    </AdminShell>
  );
}
