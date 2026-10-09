"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const initial: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  const configured = isSupabaseConfigured();

  return (
    <form className="mt-7 space-y-4" action={formAction}>
      {!configured ? (
        <p className="rounded-[10px] bg-[var(--medium-soft)] px-3 py-2 text-sm text-[var(--medium)]">
          Supabase ещё не настроен. Заполните{" "}
          <code className="font-mono text-xs">.env.local</code> по образцу{" "}
          <code className="font-mono text-xs">.env.example</code>.
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-[10px] bg-[var(--weak-soft)] px-3 py-2 text-sm text-[var(--weak)]">
          {state.error}
        </p>
      ) : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Имя</span>
        <input className="field" type="text" name="displayName" placeholder="Аня" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          className="field"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Пароль</span>
        <input
          className="field"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Минимум 8 символов"
        />
      </label>
      <button type="submit" className="btn btn-primary w-full" disabled={pending || !configured}>
        {pending ? "Создаём…" : "Создать аккаунт"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
