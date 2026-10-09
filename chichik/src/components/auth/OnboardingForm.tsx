"use client";

import { useActionState } from "react";
import { onboardingAction, type AuthActionState } from "@/lib/auth/actions";
import { MVP_SUBJECTS } from "@/lib/constants";

const initial: AuthActionState = {};

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(onboardingAction, initial);

  return (
    <form className="surface mt-8 space-y-8 p-6 sm:p-8" action={formAction}>
      {state.error ? (
        <p className="rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
          {state.error}
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-xl font-semibold">Профили</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { value: "oge", label: "ОГЭ", emoji: "📗" },
            { value: "ege", label: "ЕГЭ", emoji: "📘" },
          ].map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3"
            >
              <input
                type="checkbox"
                name="examType"
                value={item.value}
                defaultChecked
                className="size-4 accent-[var(--accent)]"
              />
              <span className="font-medium">
                {item.emoji} {item.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Предметы</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Четыре предмета MVP</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MVP_SUBJECTS.map((item) => (
            <label
              key={item.code}
              className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3"
            >
              <input
                type="checkbox"
                name="subject"
                value={item.code}
                defaultChecked
                className="size-4 accent-[var(--accent)]"
              />
              <span className="font-medium">
                {item.emoji} {item.title}
              </span>
            </label>
          ))}
        </div>
      </section>

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Сохраняем…" : "Перейти в кабинет →"}
      </button>
    </form>
  );
}
