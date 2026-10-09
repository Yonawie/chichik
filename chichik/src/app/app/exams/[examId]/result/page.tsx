import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewList } from "@/components/assessment/ReviewList";
import { PageShell } from "@/components/PageShell";
import { getExamResult, getExamWithTasks } from "@/lib/assessment/queries";
import { MVP_SUBJECTS } from "@/lib/constants";

function minutesBetween(from: string, to: string | null) {
  if (!to) return 0;
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60_000));
}

export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const [{ examId }, { attempt }] = await Promise.all([params, searchParams]);
  const [exam, result] = await Promise.all([
    getExamWithTasks(examId),
    getExamResult(examId, attempt),
  ]);
  if (!exam) notFound();
  const subject = MVP_SUBJECTS.find((s) => s.code === exam.subjectCode);

  if (!result) {
    return (
      <PageShell>
        <div className="surface p-8 text-center text-[var(--muted)]">
          <p>Вы ещё не завершали этот пробник.</p>
          <Link href={`/app/exams/${examId}`} className="btn btn-primary mt-5 inline-flex">
            Пройти пробник
          </Link>
        </div>
      </PageShell>
    );
  }

  const wrong = result.scoreMax - result.scoreRaw;
  const pct = result.scoreMax > 0 ? Math.round((100 * result.scoreRaw) / result.scoreMax) : 0;

  return (
    <PageShell>
      <Link href="/app/exams" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        ← Ко всем пробникам
      </Link>

      <div className="fade-up surface mt-4 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Результат
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          {exam.title}
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          {subject?.emoji} {subject?.title} ·{" "}
          {result.finishedAt ? new Date(result.finishedAt).toLocaleString("ru-RU") : ""}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--accent-soft)] px-4 py-4">
            <p className="text-sm text-[var(--accent-ink)]">Баллы</p>
            <p className="font-display text-3xl font-semibold text-[var(--accent-ink)]">
              {result.scoreRaw} / {result.scoreMax}
            </p>
            <p className="text-xs text-[var(--accent-ink)]">{pct}%</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-2)] px-4 py-4">
            <p className="text-sm text-[var(--muted)]">Время</p>
            <p className="font-display text-3xl font-semibold">
              {minutesBetween(result.startedAt, result.finishedAt)} мин
            </p>
            <p className="text-xs text-[var(--muted)]">из {exam.durationMin}</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-2)] px-4 py-4">
            <p className="text-sm text-[var(--muted)]">Ошибки</p>
            <p className="font-display text-3xl font-semibold">{wrong}</p>
            <p className="text-xs text-[var(--muted)]">добавлены в банк ошибок</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/app/exams/${examId}`} className="btn btn-primary">
            Пройти ещё раз
          </Link>
          {wrong > 0 ? (
            <Link href="/app/errors" className="btn btn-secondary">
              Открыть банк ошибок
            </Link>
          ) : null}
        </div>
      </div>

      {result.weakTopics.length > 0 ? (
        <section className="surface mt-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Что подтянуть</h2>
          <div className="mt-4 space-y-3">
            {result.weakTopics.map((t) => (
              <div
                key={t.topicId}
                className="flex flex-col gap-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    Верно {t.correct} из {t.total}
                  </p>
                </div>
                <Link
                  href={`/app/topics/${t.topicId}`}
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Повторить тему →
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-semibold text-[var(--accent-ink)]">Разбор</h2>
        <ReviewList items={result.review} />
      </section>
    </PageShell>
  );
}
