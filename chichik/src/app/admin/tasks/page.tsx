import { TasksAdminPanel, type TaskRow } from "@/components/admin/TasksAdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTasksPage() {
  const supabase = await createClient();
  const [{ data: topics }, { data: tasks }] = await Promise.all([
    supabase.from("topics").select("id, title, subject_code").order("sort_order"),
    supabase
      .from("tasks")
      .select(
        "id, stem, topic_id, task_type, answer_key, solution_md, difficulty, sort_order, options_json",
      )
      .order("sort_order"),
  ]);

  return (
    <AdminShell
      title="Задания"
      description="Для single/multi варианты — каждый с новой строки. Ответ = точная строка варианта или короткого ответа."
    >
      <TasksAdminPanel topics={topics ?? []} tasks={(tasks ?? []) as TaskRow[]} />
    </AdminShell>
  );
}
