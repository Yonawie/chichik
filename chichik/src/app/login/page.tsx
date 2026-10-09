import { SiteHeader } from "@/components/SiteHeader";
import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader variant="auth" />
      <PageShell className="flex items-center justify-center">
        <div className="surface fade-up w-full max-w-md p-7 sm:p-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--accent-ink)]">
            Вход в Чичик
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Войдите по email и паролю. Аккаунт хранится в Supabase Auth.
          </p>
          <LoginForm />
        </div>
      </PageShell>
    </div>
  );
}
