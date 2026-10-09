import { TopicsAdminPanel } from "@/components/admin/TopicsAdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTopicsPage() {
  const supabase = await createClient();
  const [{ data: subjects }, { data: topics }] = await Promise.all([
    supabase.from("subjects").select("code, title").order("sort_order"),
    supabase
      .from("topics")
      .select("id, title, subject_code, exam_type, theory_md, sort_order")
      .order("sort_order"),
  ]);

  return (
    <AdminShell title="Темы" description="Теория в Markdown. Изменить — кнопка «Изменить» в списке.">
      <TopicsAdminPanel subjects={subjects ?? []} topics={topics ?? []} />
    </AdminShell>
  );
}
