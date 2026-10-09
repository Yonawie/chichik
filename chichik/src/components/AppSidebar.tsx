"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoinsBadge } from "@/components/CoinsBadge";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/app", label: "🏠 Главная" },
  { href: "/app/pet", label: "🐬 Чичик" },
  { href: "/app/shop", label: "🛒 Магазин" },
  { href: "/app/diagnostics", label: "🎯 Диагностика" },
  { href: "/app/errors", label: "😅 Ошибки" },
  { href: "/app/exams", label: "⏱ Пробники" },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-[var(--sidebar)] text-[var(--sidebar-ink)] lg:flex">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-start justify-between gap-2 px-2">
            <div>
              <Link href="/app" className="font-display text-2xl font-semibold tracking-tight">
                Чичик
              </Link>
              <p className="mt-1 text-xs text-[var(--sidebar-muted)]">ОГЭ + ЕГЭ · ученик</p>
            </div>
            <CoinsBadge />
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {links.map((link) => {
              const active =
                link.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 pt-4">
            {isAdmin ? (
              <Link href="/admin" className="sidebar-link">
                🛠 Админка
              </Link>
            ) : null}
            <ThemeToggle className="w-full justify-start text-[var(--sidebar-ink)] hover:bg-white/10" />
            <LogoutButton className="sidebar-link w-full text-left" />
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="font-display text-xl font-semibold text-[var(--accent-ink)]">
            Чичик
          </Link>
          <div className="flex items-center gap-2">
            <CoinsBadge variant="light" />
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {links.map((link) => {
            const active =
              link.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--ink-soft)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
