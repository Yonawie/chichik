import { ExamsAdminPanel, type ExamRow, type TaskPick } from "@/components/admin/ExamsAdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

type ExamDbRow = {
  id: string;
  title: string;
  subject_code: string;
  exam_type: string;
  duration_min: number;
  exam_tasks: { task_id: string; sort_order: number }[] | null;
};

type TaskDbRow = {
  id: string;
  stem: string;
  topics: { subject_code: string; exam_type: string } | { subject_code: string; exam_type: string }[] | null;
};

export default async function AdminExamsPage() {
  const supabase = await createClient();
  const [{ data: subjects }, { data: examsRaw }, { data: tasksRaw }] = await Promise.all([
    supabase.from("subjects").select("code, title").order("sort_order"),
    supabase
      .from("exams")
      .select("id, title, subject_code, exam_type, duration_min, exam_tasks(task_id, sort_order)")
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, stem, topics(subject_code, exam_type)")
      .order("sort_order"),
  ]);

  const exams: ExamRow[] = ((examsRaw ?? []) as ExamDbRow[]).map((e) => {
    const links = [...(e.exam_tasks ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    return {
      id: e.id,
      title: e.title,
      subject_code: e.subject_code,
      exam_type: e.exam_type,
      duration_min: e.duration_min,
      taskIds: links.map((l) => l.task_id),
    };
  });

  const tasks: TaskPick[] = ((tasksRaw ?? []) as TaskDbRow[]).flatMap((t) => {
    const topic = Array.isArray(t.topics) ? t.topics[0] : t.topics;
    if (!topic) return [];
    return [
      {
        id: t.id,
        stem: t.stem,
        subject_code: topic.subject_code,
        exam_type: topic.exam_type,
      },
    ];
  });

  return (
    <AdminShell title="Пробники" description="Состав варианта — галочками по заданиям предмета.">
      <ExamsAdminPanel subjects={subjects ?? []} exams={exams} tasks={tasks} />
    </AdminShell>
  );
}
