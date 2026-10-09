"use client";

import Link from "next/link";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import { ReviewList } from "@/components/assessment/ReviewList";
import { submitDiagnostic } from "@/lib/assessment/actions";
import type { GradedItem, RunnerTask } from "@/lib/assessment/types";

function DiagnosticResult({ review, subjectCode }: { review: GradedItem[]; subjectCode: string }) {
  const correct = review.filter((r) => r.correct).length;
  const byTopic = new Map<string, { topicId: string; title: string; correct: number; total: number }>();
  for (const r of review) {
    const entry = byTopic.get(r.topicId) ?? { topicId: r.topicId, title: r.topicTitle, correct: 0, total: 0 };
    entry.total += 1;
    if (r.correct) entry.correct += 1;
    byTopic.set(r.topicId, entry);
  }
  const topics = [...byTopic.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);

  return (
    <div className="mt-6 space-y-8">
      <section className="surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Диагностика завершена
        </p>
        <p className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          {correct} / {review.length}
        </p>
        <div className="mt-6 space-y-3">
          {topics.map((t) => {
            const pct = Math.round((100 * t.correct) / t.total);
            return (
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
                  className={`text-sm font-semibold hover:underline ${
                    pct < 40 ? "text-[var(--weak)]" : "text-[var(--accent)]"
                  }`}
                >
                  {pct < 40 ? "Подтянуть тему →" : "К теме →"}
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/app/diagnostics?subject=${subjectCode}`} className="btn btn-primary">
            Открыть карту тем
          </Link>
          <Link href="/app/errors" className="btn btn-secondary">
            Банк ошибок
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold text-[var(--accent-ink)]">Разбор</h2>
        <ReviewList items={review} />
      </section>
    </div>
  );
}

export function DiagnosticRunner({ subjectCode, tasks }: { subjectCode: string; tasks: RunnerTask[] }) {
  return (
    <AssessmentRunner
      tasks={tasks}
      submitLabel="Завершить диагностику"
      onSubmit={(answers) => submitDiagnostic(subjectCode, answers)}
      renderResult={(review) => <DiagnosticResult review={review} subjectCode={subjectCode} />}
    />
  );
}
