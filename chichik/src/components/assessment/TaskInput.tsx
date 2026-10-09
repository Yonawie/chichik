"use client";

import type { RunnerTask } from "@/lib/assessment/types";

type Props = {
  task: RunnerTask;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

export function TaskInput({ task, value, onChange, disabled }: Props) {
  if (task.options && task.options.length > 0) {
    const multi = task.taskType === "multi";
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {task.options.map((option) => {
          const selected = value.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-sm ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] bg-[var(--surface-2)]"
              }`}
            >
              <input
                type={multi ? "checkbox" : "radio"}
                name={`task-${task.id}`}
                className="accent-[var(--accent)]"
                checked={selected}
                disabled={disabled}
                onChange={() => {
                  if (!multi) return onChange([option]);
                  onChange(selected ? value.filter((v) => v !== option) : [...value, option]);
                }}
              />
              {option}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <input
      className="field max-w-md"
      value={value[0] ?? ""}
      disabled={disabled}
      inputMode={task.taskType === "numeric" ? "decimal" : "text"}
      placeholder={task.taskType === "numeric" ? "Число" : "Ваш ответ"}
      onChange={(e) => onChange([e.target.value])}
    />
  );
}
