import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamRunner } from "@/components/assessment/ExamRunner";
import { PageShell } from "@/components/PageShell";
import { getExamWithTasks } from "@/lib/assessment/queries";
import { examTypeLabel } from "@/lib/catalog";
import { MVP_SUBJECTS } from "@/lib/constants";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = await getExamWithTasks(examId);
  if (!exam) notFound();
  const subject = MVP_SUBJECTS.find((s) => s.code === exam.subjectCode);

  return (
    <PageShell>
      <Link href="/app/exams" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        ← Ко всем пробникам
      </Link>
      <div className="fade-up mt-4">
        <p className="text-sm text-[var(--muted)]">
          {subject?.emoji} {subject?.title} · {examTypeLabel(exam.examType)}
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          {exam.title}
        </h1>
      </div>

      {exam.tasks.length === 0 ? (
        <div className="surface mt-8 p-8 text-center text-[var(--muted)]">
          В этом пробнике пока нет заданий.
        </div>
      ) : (
        <ExamRunner examId={exam.id} durationMin={exam.durationMin} tasks={exam.tasks} />
      )}
    </PageShell>
  );
}
