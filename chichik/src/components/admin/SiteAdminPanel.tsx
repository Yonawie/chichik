"use client";

import { useState } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { upsertSiteContentAction } from "@/lib/admin/actions";

export type SiteContentRow = {
  key: string;
  value_text: string;
};

const DEFAULT_KEYS = [
  "landing.hero_title",
  "landing.hero_subtitle",
  "landing.cta_primary",
];

export function SiteAdminPanel({ rows }: { rows: SiteContentRow[] }) {
  const [editing, setEditing] = useState<SiteContentRow | null>(null);
  const formKey = editing?.key ?? "new";

  function handleDeleteKey(key: string) {
    if (!confirm(`Очистить ключ «${key}»? (удаление записи — через Supabase; здесь можно сохранить пустой текст)`)) {
      return;
    }
    setEditing({ key, value_text: "" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            {editing ? `Ключ: ${editing.key}` : "Новый или существующий ключ"}
          </p>
          {editing ? (
            <button type="button" className="text-sm text-[var(--accent)]" onClick={() => setEditing(null)}>
              Отмена
            </button>
          ) : null}
        </div>
        <AdminForm
          action={upsertSiteContentAction}
          formKey={formKey}
          onSaved={() => setEditing(null)}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Ключ</span>
            <input
              className="field"
              name="key"
              list="site-keys"
              placeholder="landing.hero_title"
              required
              defaultValue={editing?.key ?? ""}
              readOnly={Boolean(editing)}
              key={`key-${formKey}`}
            />
            <datalist id="site-keys">
              {DEFAULT_KEYS.map((key) => (
                <option key={key} value={key} />
              ))}
            </datalist>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Текст</span>
            <textarea
              className="field min-h-32"
              name="value_text"
              required
              defaultValue={editing?.value_text ?? ""}
              key={`val-${formKey}`}
            />
          </label>
        </AdminForm>
      </div>

      <div className="surface max-h-[70vh] divide-y divide-[var(--line)] overflow-y-auto">
        {rows.map((row) => (
          <div key={row.key} className="px-4 py-3">
            <p className="font-mono text-xs text-[var(--muted)]">{row.key}</p>
            <p className="mt-1 text-sm">{row.value_text}</p>
            <AdminRowActions
              onEdit={() => setEditing(row)}
              onDelete={() => handleDeleteKey(row.key)}
              deleteLabel="Очистить"
            />
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--muted)]">
            Пока нет записей. Пример ключа: {DEFAULT_KEYS[0]}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
