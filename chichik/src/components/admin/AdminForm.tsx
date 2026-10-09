"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AdminActionState } from "@/lib/admin/actions";

type Props = {
  action: (
    prev: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  /** Меняется при выборе записи — сбрасывает форму */
  formKey?: string;
  onSaved?: () => void;
};

const initial: AdminActionState = {};

export function AdminForm({
  action,
  children,
  submitLabel = "Сохранить",
  formKey = "new",
  onSaved,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const lastOk = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && !lastOk.current) {
      lastOk.current = true;
      onSaved?.();
      router.refresh();
    }
    if (!state.ok) lastOk.current = false;
  }, [state.ok, onSaved, router]);

  return (
    <form
      key={formKey}
      action={formAction}
      className="surface space-y-4 p-5 sm:p-6"
    >
      {state.error ? (
        <p className="rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-[10px] bg-[var(--good-soft)] px-3 py-2 text-sm text-[var(--good)]">
          Сохранено. Ученики увидят изменения сразу.
        </p>
      ) : null}
      {children}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Сохраняем…" : submitLabel}
      </button>
    </form>
  );
}
