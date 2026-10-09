import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

type SiteHeaderProps = {
  variant?: "marketing" | "auth" | "hero";
};

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const onHero = variant === "hero";

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="group flex items-baseline gap-2">
        <span
          className={`font-display text-2xl font-semibold tracking-tight transition-colors sm:text-3xl ${
            onHero
              ? "text-white group-hover:text-white/85"
              : "text-[var(--accent-ink)] group-hover:text-[var(--accent)]"
          }`}
        >
          Чичик
        </span>
        <span
          className={`hidden text-sm sm:inline ${
            onHero ? "text-white/70" : "text-[var(--muted)]"
          }`}
        >
          ОГЭ и ЕГЭ
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle
          className={onHero ? "text-white hover:bg-white/15 hover:text-white" : ""}
        />
        {variant === "auth" ? (
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
          >
            На главную
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={`btn px-4 text-sm ${
                onHero
                  ? "border border-white/35 bg-white/10 text-white hover:bg-white/20"
                  : "btn-secondary"
              }`}
            >
              Войти
            </Link>
            <Link href="/register" className="btn btn-primary px-4 text-sm">
              Начать
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
