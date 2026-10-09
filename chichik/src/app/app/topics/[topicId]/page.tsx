import Link from "next/link";
import { notFound } from "next/navigation";
import { MasteryBadge } from "@/components/MasteryBadge";
import { PageShell } from "@/components/PageShell";
import { PracticeTaskCard } from "@/components/practice/PracticeTaskCard";
import { TheoryBlock } from "@/components/TheoryBlock";
import {
  examTypeLabel,
  getCatalogSubject,
  getCatalogTopic,
  listTasksForTopic,
} from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getCatalogTopic(topicId);
  if (!topic) notFound();

  const [subject, tasks] = await Promise.all([
    getCatalogSubject(topic.subjectCode),
    listTasksForTopic(topic.id),
  ]);
  const canCheck = isSupabaseConfigured() && topic.source === "db";

  return (
    <PageShell>
      <Link
        href={`/app/subjects/${topic.subjectCode}`}
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← {subject ? `${subject.emoji} ${subject.title}` : "К предмету"}
      </Link>

      <div className="fade-up mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {subject ? `${subject.emoji} ${subject.title}` : ""} · {examTypeLabel(topic.examType)}
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold text-[var(--accent-ink)]">
            {topic.emoji} {topic.title}
          </h1>
          <span className="mt-2 inline-flex badge bg-[var(--accent-soft)] text-[var(--accent-ink)]">
            {examTypeLabel(topic.examType)}
          </span>
        </div>
        <MasteryBadge mastery={topic.mastery} />
      </div>

      <section className="surface mt-8 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">📚 Теория</h2>
        <div className="mt-4">
          <TheoryBlock markdown={topic.theoryMd || topic.theoryPreview} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold text-[var(--accent-ink)]">
          ✅ Практика
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Проверьте ответ — за верный получите +5 💠 чириков.
        </p>
        <div className="mt-5 space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <PracticeTaskCard
                key={task.id}
                task={task}
                index={index}
                topicId={topic.id}
                canCheck={canCheck && task.source === "db"}
              />
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Заданий пока нет. Добавьте их в админке или выполните seed.sql.
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
