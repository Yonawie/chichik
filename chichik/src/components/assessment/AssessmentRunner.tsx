"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePet } from "@/components/PetProvider";
import { ReviewList } from "@/components/assessment/ReviewList";
import { TaskInput } from "@/components/assessment/TaskInput";
import type { AnswerInput, GradedItem, RunnerTask, SubmitResult } from "@/lib/assessment/types";
import { CHIRIKI_PER_CORRECT } from "@/lib/pet-store";

type Props = {
  tasks: RunnerTask[];
  onSubmit: (answers: AnswerInput[]) => Promise<SubmitResult>;
  submitLabel: string;
  timer?: { startedAt: string; durationMin: number };
  renderResult?: (review: GradedItem[]) => React.ReactNode;
};

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AssessmentRunner({ tasks, onSubmit, submitLabel, timer, renderResult }: Props) {
  const router = useRouter();
  const { rewardCorrect } = usePet();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [review, setReview] = useState<GradedItem[] | null>(null);
  const [pending, startTransition] = useTransition();
  const submitted = useRef(false);

  const deadline = timer
    ? new Date(timer.startedAt).getTime() + timer.durationMin * 60_000
    : null;
  const [remaining, setRemaining] = useState(() =>
    deadline ? Math.max(0, Math.round((deadline - Date.now()) / 1000)) : 0,
  );

  const answeredCount = tasks.filter((t) => (answers[t.id] ?? []).some((v) => v.trim())).length;

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    setError("");
    const payload = tasks.map((t) => ({ taskId: t.id, answer: (answers[t.id] ?? []).join(";") }));
    startTransition(async () => {
      const result = await onSubmit(payload);
      if (!result.ok) {
        submitted.current = false;
        setError(result.message);
        return;
      }
      if (result.correctCount > 0) rewardCorrect(result.correctCount);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }
      setReview(result.review ?? []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [answers, onSubmit, rewardCorrect, router, tasks]);

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        submitRef.current();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (review) {
    return <>{renderResult ? renderResult(review) : <ReviewList items={review} />}</>;
  }

  const onFinishClick = () => {
    const missing = tasks.length - answeredCount;
    if (missing > 0 && !window.confirm(`Без ответа: ${missing}. Завершить?`)) return;
    submit();
  };

  return (
    <div className="mt-6">
      <div className="surface sticky top-3 z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-[var(--ink-soft)]">
          Отвечено: <span className="font-semibold">{answeredCount}</span> из {tasks.length}
        </p>
        {deadline ? (
          <p
            className={`font-display text-2xl font-semibold tabular-nums ${
              remaining < 60 ? "text-[var(--weak)]" : "text-[var(--accent-ink)]"
            }`}
            aria-live="polite"
          >
            ⏱ {formatTime(remaining)}
          </p>
        ) : null}
        <p className="text-xs text-[var(--muted)]">
          За верный ответ +{CHIRIKI_PER_CORRECT} 💠 после проверки
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {tasks.map((task, index) => (
          <article key={task.id} className="surface p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Задание {index + 1} из {tasks.length} · {task.topicTitle}
            </p>
            <p className="mt-3 text-lg font-medium leading-snug">{task.stem}</p>
            {task.taskType === "multi" ? (
              <p className="mt-1 text-xs text-[var(--muted)]">Выберите все верные варианты.</p>
            ) : null}
            <div className="mt-4">
              <TaskInput
                task={task}
                value={answers[task.id] ?? []}
                disabled={pending}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [task.id]: value }))}
              />
            </div>
          </article>
        ))}
      </div>

      {error ? (
        <p className="mt-6 rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={onFinishClick}>
          {pending ? "Проверяем…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
