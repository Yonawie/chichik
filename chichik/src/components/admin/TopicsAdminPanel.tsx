"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { deleteTopicAction, upsertTopicAction } from "@/lib/admin/actions";

type SubjectOption = { code: string; title: string };

export type TopicRow = {
  id: string;
  title: string;
  subject_code: string;
  exam_type: string;
  theory_md: string | null;
  sort_order: number | null;
};

export function TopicsAdminPanel({
  subjects,
  topics,
}: {
  subjects: SubjectOption[];
  topics: TopicRow[];
}) {
  const [editing, setEditing] = useState<TopicRow | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formKey = editing?.id ?? "new";
  const defaultSubject = subjects[0]?.code ?? "";

  function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить тему «${title}» и все её задания?`)) return;
    startTransition(async () => {
      const res = await deleteTopicAction(id);
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
            {editing ? `Редактирование: ${editing.title}` : "Новая тема"}
          </p>
          {editing ? (
            <button type="button" className="text-sm text-[var(--accent)]" onClick={() => setEditing(null)}>
              Отмена
            </button>
          ) : null}
        </div>
        <AdminForm
          action={upsertTopicAction}
          submitLabel={editing ? "Обновить тему" : "Сохранить тему"}
          formKey={formKey}
          onSaved={() => setEditing(null)}
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Предмет</span>
            <select
              className="field"
              name="subject_code"
              required
              defaultValue={editing?.subject_code ?? defaultSubject}
              key={`sub-${formKey}`}
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
              defaultValue={editing?.exam_type ?? "ege"}
              key={`exam-${formKey}`}
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
            <span className="text-sm font-medium">Теория (Markdown)</span>
            <textarea
              className="field min-h-40"
              name="theory_md"
              defaultValue={editing?.theory_md ?? ""}
              key={`theory-${formKey}`}
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
        </AdminForm>
      </div>

      <div className="surface max-h-[70vh] divide-y divide-[var(--line)] overflow-y-auto">
        {topics.map((t) => (
          <div key={t.id} className="px-4 py-3">
            <p className="font-semibold">{t.title}</p>
            <p className="text-xs text-[var(--muted)]">
              {t.subject_code} · {t.exam_type.toUpperCase()}
            </p>
            <AdminRowActions onEdit={() => setEditing(t)} onDelete={() => handleDelete(t.id, t.title)} />
          </div>
        ))}
        {topics.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--muted)]">Тем пока нет.</p>
        ) : null}
        {pending ? <p className="px-4 py-2 text-xs text-[var(--muted)]">Обновление…</p> : null}
      </div>
    </div>
  );
}
