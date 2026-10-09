"use client";

import { useState, useTransition } from "react";
import { AssessmentRunner } from "@/components/assessment/AssessmentRunner";
import { finishExamAttempt, startExamAttempt } from "@/lib/assessment/actions";
import type { RunnerTask } from "@/lib/assessment/types";

type Props = {
  examId: string;
  durationMin: number;
  tasks: RunnerTask[];
};

export function ExamRunner({ examId, durationMin, tasks }: Props) {
  const [attempt, setAttempt] = useState<{ id: string; startedAt: string } | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (attempt) {
    return (
      <AssessmentRunner
        tasks={tasks}
        submitLabel="Завершить пробник"
        timer={{ startedAt: attempt.startedAt, durationMin }}
        onSubmit={(answers) => finishExamAttempt(attempt.id, answers)}
      />
    );
  }

  const start = () => {
    setError("");
    startTransition(async () => {
      const result = await startExamAttempt(examId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setAttempt({ id: result.attemptId, startedAt: result.startedAt });
    });
  };

  return (
    <section className="surface mt-6 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Правила</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
        <li>
          {tasks.length} заданий, на всё — {durationMin} минут.
        </li>
        <li>Подсказок и проверки по ходу нет — разбор откроется после завершения.</li>
        <li>Когда время закончится, ответы отправятся автоматически.</li>
        <li>Неверные ответы попадут в банк ошибок.</li>
      </ul>
      {error ? (
        <p className="mt-4 rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="btn btn-primary mt-6"
        disabled={pending || tasks.length === 0}
        onClick={start}
      >
        {pending ? "Запускаем…" : "⏱ Начать пробник"}
      </button>
    </section>
  );
}
