import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MasteryBadge } from "@/components/MasteryBadge";
import { PageShell } from "@/components/PageShell";
import {
  examTypeLabel,
  getCatalogSubject,
  getTopicsGrouped,
  type CatalogTopic,
} from "@/lib/catalog";

function TopicList({ topics, startIndex }: { topics: CatalogTopic[]; startIndex: number }) {
  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <Link
          key={topic.id}
          href={`/app/topics/${topic.id}`}
          className="surface flex flex-col gap-3 p-5 transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Тема {startIndex + index + 1}
              </p>
              <span className="badge bg-[var(--accent-soft)] text-[var(--accent-ink)]">
                {examTypeLabel(topic.examType)}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {topic.emoji} {topic.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">{topic.theoryPreview}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <MasteryBadge mastery={topic.mastery} />
            <span className="text-xs text-[var(--muted)]">{topic.tasksCount} заданий</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: code } = await params;
  const [subject, grouped] = await Promise.all([
    getCatalogSubject(code),
    getTopicsGrouped(code),
  ]);
  if (!subject) notFound();

  const hasOge = subject.examTypes.includes("oge");
  const hasEge = subject.examTypes.includes("ege");
  // Химия — только ЕГЭ: показываем все темы в одном блоке ЕГЭ
  const egeTopics = hasOge ? grouped.ege : [...grouped.oge, ...grouped.ege];
  const ogeTopics = hasOge ? grouped.oge : [];

  return (
    <PageShell>
      <Link href="/app" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        ← Ко всем предметам
      </Link>

      <div className="fade-up surface mt-4 overflow-hidden">
        <div className="relative aspect-[21/8] min-h-36">
          <Image
            src={subject.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,30,25,0.75)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                {subject.emoji} {subject.title}
              </h1>
              <p className="mt-1 text-white/80">{subject.short}</p>
              <p className="mt-2 text-sm font-semibold text-white/90">
                {subject.examTypes.map((t) => (t === "oge" ? "ОГЭ" : "ЕГЭ")).join(" · ")}
                {" · "}
                {ogeTopics.length + egeTopics.length} тем
              </p>
            </div>
            <MasteryBadge mastery={subject.mastery} />
          </div>
        </div>
      </div>

      {hasOge ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">📗 Темы ОГЭ</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{ogeTopics.length} тем</p>
          <div className="mt-4">
            {ogeTopics.length > 0 ? (
              <TopicList topics={ogeTopics} startIndex={0} />
            ) : (
              <p className="rounded-[12px] border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[var(--muted)]">
                Тем ОГЭ пока нет. Добавьте их в админке или выполните content-full.sql в Supabase.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {hasEge ? (
        <section className={hasOge ? "mt-10" : "mt-8"}>
          <h2 className="font-display text-2xl font-semibold">📘 Темы ЕГЭ</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{egeTopics.length} тем</p>
          <div className="mt-4">
            {egeTopics.length > 0 ? (
              <TopicList
                topics={egeTopics}
                startIndex={hasOge ? ogeTopics.length : 0}
              />
            ) : (
              <p className="rounded-[12px] border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[var(--muted)]">
                Тем ЕГЭ пока нет. Добавьте их в админке или выполните content-full.sql в Supabase.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
