"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { deleteExamAction, upsertExamAction } from "@/lib/admin/actions";

type SubjectOption = { code: string; title: string };

export type TaskPick = {
  id: string;
  stem: string;
  subject_code: string;
  exam_type: string;
};

export type ExamRow = {
  id: string;
  title: string;
  subject_code: string;
  exam_type: string;
  duration_min: number;
  taskIds: string[];
};

export function ExamsAdminPanel({
  subjects,
  exams,
  tasks,
}: {
  subjects: SubjectOption[];
  exams: ExamRow[];
  tasks: TaskPick[];
}) {
  const [editing, setEditing] = useState<ExamRow | null>(null);
  const [formSubject, setFormSubject] = useState(subjects[0]?.code ?? "");
  const [formExamType, setFormExamType] = useState("ege");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formKey = editing?.id ?? "new";

  const pickableTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.subject_code === formSubject && t.exam_type === formExamType,
    );
  }, [tasks, formSubject, formExamType]);

  function startEdit(exam: ExamRow) {
    setEditing(exam);
    setFormSubject(exam.subject_code);
    setFormExamType(exam.exam_type);
    setSelectedTasks(exam.taskIds);
  }

  function startNew() {
    setEditing(null);
    setFormSubject(subjects[0]?.code ?? "");
    setFormExamType("ege");
    setSelectedTasks([]);
  }

  function toggleTask(id: string) {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить пробник «${title}»?`)) return;
    startTransition(async () => {
      const res = await deleteExamAction(id);
      if (res.error) alert(res.error);
      else {
        if (editing?.id === id) startNew();
        router.refresh();
      }
    });
  }

  const taskIdsValue = pickableTasks
    .filter((t) => selectedTasks.includes(t.id))
    .map((t) => t.id)
    .concat(selectedTasks.filter((id) => !pickableTasks.some((t) => t.id === id)))
    .join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            {editing ? `Редактирование: ${editing.title}` : "Новый пробник"}
          </p>
          {editing ? (
            <button type="button" className="text-sm text-[var(--accent)]" onClick={startNew}>
              Отмена
            </button>
          ) : null}
        </div>
        <AdminForm
          action={upsertExamAction}
          submitLabel={editing ? "Обновить пробник" : "Сохранить пробник"}
          formKey={formKey}
          onSaved={startNew}
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <input type="hidden" name="task_ids" value={taskIdsValue} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Предмет</span>
            <select
              className="field"
              name="subject_code"
              required
              value={formSubject}
              onChange={(e) => {
                setFormSubject(e.target.value);
                setSelectedTasks([]);
              }}
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Профиль</span>
            <select
              className="field"
              name="exam_type"
              value={formExamType}
              onChange={(e) => {
                setFormExamType(e.target.value);
                setSelectedTasks([]);
              }}
            >
              <option value="oge">ОГЭ</option>
              <option value="ege">ЕГЭ</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Название</span>
            <input
              className="field"
              name="title"
              required
              defaultValue={editing?.title ?? ""}
              key={`title-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Длительность (мин)</span>
            <input
              className="field"
              name="duration_min"
              type="number"
              defaultValue={editing?.duration_min ?? 40}
              key={`dur-${formKey}`}
            />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Задания в варианте ({selectedTasks.length})
            </p>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-[10px] border border-[var(--line)] p-3">
              {pickableTasks.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Нет заданий для этого предмета и профиля. Добавьте их в разделе «Задания».
                </p>
              ) : (
                pickableTasks.map((t) => (
                  <label key={t.id} className="flex cursor-pointer gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(t.id)}
                      onChange={() => toggleTask(t.id)}
                      className="mt-1"
                    />
                    <span>{t.stem}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">
              Порядок в варианте — как при отметке сверху вниз.
            </p>
          </div>
        </AdminForm>
      </div>

      <div className="surface max-h-[70vh] divide-y divide-[var(--line)] overflow-y-auto">
        {exams.map((e) => (
          <div key={e.id} className="px-4 py-3">
            <p className="font-semibold">{e.title}</p>
            <p className="text-xs text-[var(--muted)]">
              {e.subject_code} · {e.exam_type.toUpperCase()} · {e.duration_min} мин ·{" "}
              {e.taskIds.length} заданий
            </p>
            <AdminRowActions onEdit={() => startEdit(e)} onDelete={() => handleDelete(e.id, e.title)} />
          </div>
        ))}
        {exams.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--muted)]">Пробников пока нет.</p>
        ) : null}
        {pending ? <p className="px-4 py-2 text-xs text-[var(--muted)]">Обновление…</p> : null}
      </div>
    </div>
  );
}
