import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader variant="auth" />
      <PageShell>
        <div className="fade-up mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Онбординг
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
            Настроим Чичик под вас
          </h1>
          <p className="mt-3 text-[var(--ink-soft)]">
            Выберите профили экзаменов и предметы. Настройки сохранятся в аккаунте.
          </p>
          <OnboardingForm />
        </div>
      </PageShell>
    </div>
  );
}
