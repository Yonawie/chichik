"use client";

import { useActionState, useEffect, useRef } from "react";
import { usePet } from "@/components/PetProvider";
import {
  submitPracticeAnswer,
  type PracticeResult,
} from "@/lib/practice/actions";
import { CHIRIKI_PER_CORRECT } from "@/lib/pet-store";
import type { CatalogTask } from "@/lib/catalog";

type Props = {
  task: CatalogTask;
  index: number;
  topicId: string;
  canCheck: boolean;
};

const initial: PracticeResult | null = null;

export function PracticeTaskCard({ task, index, topicId, canCheck }: Props) {
  const { rewardCorrect } = usePet();
  const [state, formAction, pending] = useActionState(submitPracticeAnswer, initial);
  const rewarded = useRef(false);

  useEffect(() => {
    if (state?.ok && state.correct && !rewarded.current) {
      rewarded.current = true;
      rewardCorrect();
    }
  }, [state, rewardCorrect]);

  return (
    <article className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Задание {index + 1}
        </p>
        <span className="badge bg-[var(--surface-2)] text-[var(--muted)]">
          {task.taskType} · сл. {task.difficulty}
        </span>
      </div>
      <p className="mt-3 text-lg font-medium leading-snug">{task.stem}</p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="topicId" value={topicId} />

        {task.options && task.options.length > 0 ? (
          <div className="grid gap-2">
            {task.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm"
              >
                <input
                  type={task.taskType === "multi" ? "checkbox" : "radio"}
                  name="answer"
                  value={option}
                  required={task.taskType !== "multi"}
                  className="accent-[var(--accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        ) : (
          <input
            className="field max-w-md"
            name="answer"
            required
            placeholder={task.taskType === "numeric" ? "Число" : "Ваш ответ"}
          />
        )}

        <button type="submit" className="btn btn-primary" disabled={pending || !canCheck}>
          {pending ? "Проверяем…" : "Проверить ответ"}
        </button>

        {!canCheck ? (
          <p className="text-sm text-[var(--medium)]">
            Автопроверка работает после настройки Supabase (.env.local + SQL).
          </p>
        ) : null}

        {state?.ok ? (
          <div
            className={`rounded-[10px] px-3 py-2 text-sm ${
              state.correct
                ? "bg-[var(--good-soft)] text-[var(--good)]"
                : "bg-[var(--weak-soft)] text-[var(--weak)]"
            }`}
          >
            <p className="font-semibold">{state.message}</p>
            {state.correct ? (
              <p className="mt-1">+{CHIRIKI_PER_CORRECT} 💠 чириков</p>
            ) : null}
            {state.solution ? (
              <p className="mt-2 whitespace-pre-wrap text-[var(--ink-soft)]">{state.solution}</p>
            ) : null}
          </div>
        ) : null}
        {state && !state.ok ? (
          <p className="rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
            {state.message}
          </p>
        ) : null}
      </form>
    </article>
  );
}
