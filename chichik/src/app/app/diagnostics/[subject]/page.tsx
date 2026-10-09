import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagnosticRunner } from "@/components/assessment/DiagnosticRunner";
import { PageShell } from "@/components/PageShell";
import { getDiagnosticTasks } from "@/lib/assessment/queries";
import { getCatalogSubject } from "@/lib/catalog";

export default async function DiagnosticRunPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: code } = await params;
  const [subject, tasks] = await Promise.all([getCatalogSubject(code), getDiagnosticTasks(code)]);
  if (!subject) notFound();

  return (
    <PageShell>
      <Link
        href={`/app/diagnostics?subject=${code}`}
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← К карте тем
      </Link>
      <div className="fade-up mt-4">
        <p className="text-sm text-[var(--muted)]">🎯 Диагностика</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          {subject.emoji} {subject.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Ответьте на все задания и нажмите «Завершить» — разбор и карта тем появятся сразу.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="surface mt-8 p-8 text-center text-[var(--muted)]">
          Для диагностики пока нет заданий. Добавьте их в админке.
        </div>
      ) : (
        <DiagnosticRunner subjectCode={code} tasks={tasks} />
      )}
    </PageShell>
  );
}
