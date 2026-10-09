import Link from "next/link";
import { MasteryBadge } from "@/components/MasteryBadge";
import { PageShell } from "@/components/PageShell";
import {
  DIAGNOSTIC_TASKS_PER_TOPIC,
  getSubjectMasteryMap,
  type TopicMasteryRow,
} from "@/lib/assessment/queries";
import { examTypeLabel, getTopicsGrouped, listSubjects } from "@/lib/catalog";
import { MVP_SUBJECTS } from "@/lib/constants";

export default async function DiagnosticsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject: requested } = await searchParams;
  const catalogSubjects = await listSubjects();
  const subjects = MVP_SUBJECTS.map((s) => {
    const fromCatalog = catalogSubjects.find((c) => c.code === s.code);
    return {
      code: s.code,
      title: fromCatalog?.title ?? s.title,
      emoji: fromCatalog?.emoji ?? s.emoji,
      topicsTotal: fromCatalog?.topicsTotal ?? 0,
    };
  });
  const current = subjects.find((s) => s.code === requested) ?? subjects[0];

  const dbTopics = await getSubjectMasteryMap(current.code);
  const canRun = dbTopics.length > 0;
  let topics: TopicMasteryRow[] = dbTopics;
  if (!canRun) {
    const grouped = await getTopicsGrouped(current.code);
    topics = [...grouped.oge, ...grouped.ege].map((t) => ({
      id: t.id,
      title: t.title,
      examType: t.examType,
      mastery: null,
      lastDiagnosedAt: null,
    }));
  }

  const checked = topics.filter((t) => t.mastery !== null);
  const weak = checked
    .filter((t) => (t.mastery ?? 0) < 40)
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0));
  const diagnosedAt = topics
    .map((t) => t.lastDiagnosedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <PageShell>
      <div className="fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          🎯 Диагностика
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          Карта слабых тем
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Короткий тест по всем темам предмета: по {DIAGNOSTIC_TASKS_PER_TOPIC} задания на тему.
          После него видно, что подтянуть в первую очередь.
        </p>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Link
            key={subject.code}
            href={`/app/diagnostics?subject=${subject.code}`}
            className={`surface px-4 py-4 text-left transition-transform hover:-translate-y-0.5 ${
              subject.code === current?.code ? "ring-2 ring-[var(--accent)]" : ""
            }`}
          >
            <p className="font-semibold">
              {subject.emoji} {subject.title}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {subject.code === current.code ? "Выбрано" : "Открыть карту тем"}
            </p>
          </Link>
        ))}
      </section>

      {current ? (
        <section className="surface mt-8 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {current.emoji} {current.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {diagnosedAt
                  ? `Последняя диагностика: ${new Date(diagnosedAt).toLocaleDateString("ru-RU")}`
                  : "Диагностику ещё не проходили"}
                {" · "}проверено тем: {checked.length} из {topics.length}
              </p>
            </div>
            {canRun ? (
              <Link href={`/app/diagnostics/${current.code}`} className="btn btn-primary">
                🚀 {diagnosedAt ? "Пройти ещё раз" : "Пройти диагностику"}
              </Link>
            ) : (
              <span className="btn btn-secondary pointer-events-none opacity-60">
                🚀 Тест скоро
              </span>
            )}
          </div>

          {!canRun ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Задания для этого предмета ещё не загружены в базу — тест станет доступен, когда их
              добавят (файл content-full.sql или админка).
            </p>
          ) : null}

          {weak.length > 0 ? (
            <div className="mt-6 rounded-[12px] bg-[var(--weak-soft)] px-4 py-3 text-sm text-[var(--weak)]">
              Слабые темы: {weak.map((t) => t.title).join(", ")}. Начните с «{weak[0].title}».
            </div>
          ) : null}

          {topics.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              В этом предмете пока нет тем. Их можно добавить в админке.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {topic.title}{" "}
                      <span className="text-xs text-[var(--muted)]">
                        · {examTypeLabel(topic.examType)}
                      </span>
                    </p>
                    <div className="progress mt-3 max-w-xs">
                      <span style={{ width: `${topic.mastery ?? 0}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {topic.mastery === null ? (
                      <span className="badge bg-[var(--surface)] text-[var(--muted)]">
                        Не проверено
                      </span>
                    ) : (
                      <MasteryBadge mastery={topic.mastery} />
                    )}
                    <Link
                      href={`/app/topics/${topic.id}`}
                      className="text-sm font-semibold text-[var(--accent)] hover:underline"
                    >
                      Практиковать →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </PageShell>
  );
}
