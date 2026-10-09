import Link from "next/link";
import type { GradedItem } from "@/lib/assessment/types";

export function ReviewList({ items }: { items: GradedItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Нет данных для разбора.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <article
          key={`${item.taskId}-${index}`}
          className={`surface border-l-4 p-5 sm:p-6 ${
            item.correct ? "border-l-[var(--good)]" : "border-l-[var(--weak)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Задание {index + 1} · {item.topicTitle}
            </p>
            <span className={`badge ${item.correct ? "badge-good" : "badge-weak"}`}>
              {item.correct ? "Верно" : item.userAnswer ? "Неверно" : "Нет ответа"}
            </span>
          </div>
          <p className="mt-3 text-lg font-medium leading-snug">{item.stem}</p>
          <dl className="mt-3 grid gap-1 text-sm">
            <div className="flex flex-wrap gap-2">
              <dt className="text-[var(--muted)]">Ваш ответ:</dt>
              <dd className="font-semibold">{item.userAnswer || "—"}</dd>
            </div>
            {!item.correct ? (
              <div className="flex flex-wrap gap-2">
                <dt className="text-[var(--muted)]">Правильный ответ:</dt>
                <dd className="font-semibold text-[var(--good)]">{item.answerKey}</dd>
              </div>
            ) : null}
          </dl>
          {item.solution ? (
            <p className="mt-3 whitespace-pre-wrap rounded-[10px] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--ink-soft)]">
              {item.solution}
            </p>
          ) : null}
          {!item.correct ? (
            <Link
              href={`/app/topics/${item.topicId}`}
              className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Повторить тему →
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
