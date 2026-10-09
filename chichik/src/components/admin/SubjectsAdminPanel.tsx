"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { deleteSubjectAction, upsertSubjectAction } from "@/lib/admin/actions";

export type SubjectRow = {
  code: string;
  title: string;
  short_description: string | null;
  emoji: string | null;
  sort_order: number | null;
};

export function SubjectsAdminPanel({ subjects }: { subjects: SubjectRow[] }) {
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const formKey = editing?.code ?? "new";

  function handleDelete(code: string, title: string) {
    if (
      !confirm(
        `Удалить предмет «${title}»? Удалятся все темы, задания и пробники по этому предмету.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteSubjectAction(code);
      if (res.error) alert(res.error);
      else {
        if (editing?.code === code) setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            {editing ? `Редактирование: ${editing.title}` : "Новый предмет"}
          </p>
          {editing ? (
            <button type="button" className="text-sm text-[var(--accent)]" onClick={() => setEditing(null)}>
              Отмена
            </button>
          ) : null}
        </div>
        <AdminForm
          action={upsertSubjectAction}
          submitLabel={editing ? "Обновить предмет" : "Сохранить предмет"}
          formKey={formKey}
          onSaved={() => setEditing(null)}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Код</span>
            <input
              className="field"
              name="code"
              placeholder="russian"
              required
              defaultValue={editing?.code ?? ""}
              readOnly={Boolean(editing)}
              key={`code-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Название</span>
            <input
              className="field"
              name="title"
              placeholder="Русский язык"
              required
              defaultValue={editing?.title ?? ""}
              key={`title-${formKey}`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Кратко</span>
            <input
              className="field"
              name="short_description"
              placeholder="Орфография…"
              defaultValue={editing?.short_description ?? ""}
              key={`short-${formKey}`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Эмодзи</span>
              <input
                className="field"
                name="emoji"
                defaultValue={editing?.emoji ?? "📘"}
                key={`emoji-${formKey}`}
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

      <div className="surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Код</th>
              <th className="px-4 py-3 font-medium">Название</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.code} className="border-t border-[var(--line)] align-top">
                <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3">
                  {s.emoji} {s.title}
                  <AdminRowActions
                    onEdit={() => setEditing(s)}
                    onDelete={() => handleDelete(s.code, s.title)}
                  />
                </td>
              </tr>
            ))}
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-[var(--muted)]">
                  Пока пусто. Выполните seed.sql или добавьте предмет слева.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
