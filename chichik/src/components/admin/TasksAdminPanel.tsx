"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { deleteTaskAction, upsertTaskAction } from "@/lib/admin/actions";

type TopicOption = { id: string; title: string; subject_code: string };

export type TaskRow = {
  id: string;
  stem: string;
  topic_id: string;
  task_type: string;
  answer_key: string;
  solution_md: string | null;
  difficulty: number | null;
  sort_order: number | null;
  options_json: string[] | null;
};

function optionsToText(options: string[] | null) {
  if (!options?.length) return "";
  return options.join("\n");
}

export function TasksAdminPanel({ topics, tasks }: { topics: TopicOption[]; tasks: TaskRow[] }) {
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formKey = editing?.id ?? "new";

  const subjects = useMemo(() => {
    const codes = [...new Set(topics.map((t) => t.subject_code))];
    return codes.sort();
  }, [topics]);

  const filteredTasks = useMemo(() => {
    if (!filterSubject) return tasks;
    const topicIds = new Set(topics.filter((t) => t.subject_code === filterSubject).map((t) => t.id));
    return tasks.filter((t) => topicIds.has(t.topic_id));
  }, [tasks, topics, filterSubject]);

  function handleDelete(id: string, stem: string) {
    const preview = stem.length > 60 ? `${stem.slice(0, 60)}…` : stem;
    if (!confirm(`Удалить задание «${preview}»?`)) return;
    startTransition(async () => {
      const res = await deleteTaskAction(id);
      if (res.error) alert(res.error);
      else {
        if (editing?.id === id) setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            {editing ? "Редактирование задания" : "Новое задание"}
          </p>
          {editing ? (
            <button type="button" className="text-sm text-[var(--accent)]" onClick={() => setEditing(null)}>
              Отмена
            </button>
          ) : null}
        </div>
        <AdminForm
          action={upsertTaskAction}
          submitLabel={editing ? "Обновить задание" : "Сохранить задание"}
          formKey={formKey}
          onSaved={() => setEditing(null)}
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Тема</span>
            <select
              className="field"
              name="topic_id"
              required
              defaultValue={editing?.topic_id ?? topics[0]?.id}
              key={`topic-${formKey}`}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject_code}: {t.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Тип</span>
            <select
              className="field"
              name="task_type"
              defaultValue={editing?.task_type ?? "single"}
              key={`type-${formKey}`}
            >
              <option value="single">single</option>
              <option value="multi">multi</option>
              <option value="short">short</option>
              <option value="numeric">numeric</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Условие</span>
            <textarea
              className="field min-h-24"
              name="stem"
              required
              defaultValue={editing?.stem ?? ""}
              key={`stem-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Варианты (по строке)</span>
            <textarea
              className="field min-h-24"
              name="options"
              placeholder={"вариант 1\nвариант 2"}
              defaultValue={optionsToText(editing?.options_json ?? null)}
              key={`opt-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Правильный ответ</span>
            <input
              className="field"
              name="answer_key"
              required
              defaultValue={editing?.answer_key ?? ""}
              key={`ans-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Разбор</span>
            <textarea
              className="field min-h-20"
              name="solution_md"
              defaultValue={editing?.solution_md ?? ""}
              key={`sol-${formKey}`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Сложность</span>
              <input
                className="field"
                name="difficulty"
                type="number"
                min={1}
                max={3}
                defaultValue={editing?.difficulty ?? 1}
                key={`diff-${formKey}`}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Порядок</span>
              <input
                className="field"
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 1}
                key={`sort-${formKey}`}
              />
            </label>
          </div>
        </AdminForm>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--muted)]">Фильтр:</span>
          <select
            className="field max-w-xs py-1.5 text-sm"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Все предметы</option>
            {subjects.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--muted)]">{filteredTasks.length} заданий</span>
        </div>
        <div className="surface max-h-[70vh] divide-y divide-[var(--line)] overflow-y-auto">
          {filteredTasks.map((t) => (
            <div key={t.id} className="px-4 py-3">
              <p className="font-semibold">{t.stem}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {t.task_type} · ответ: {t.answer_key}
              </p>
              <AdminRowActions onEdit={() => setEditing(t)} onDelete={() => handleDelete(t.id, t.stem)} />
            </div>
          ))}
          {filteredTasks.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--muted)]">Заданий пока нет.</p>
          ) : null}
          {pending ? <p className="px-4 py-2 text-xs text-[var(--muted)]">Обновление…</p> : null}
        </div>
      </div>
    </div>
  );
}
