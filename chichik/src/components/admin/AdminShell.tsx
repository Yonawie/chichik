import Link from "next/link";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/subjects", label: "Предметы" },
  { href: "/admin/topics", label: "Темы" },
  { href: "/admin/tasks", label: "Задания" },
  { href: "/admin/exams", label: "Пробники" },
  { href: "/admin/site", label: "Лендинг" },
];

export function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-full bg-[var(--bg)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Админка Чичик
            </p>
            <h1 className="font-display text-2xl font-semibold text-[var(--accent-ink)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app" className="btn btn-secondary text-sm">
              Кабинет ученика
            </Link>
            <Link href="/" className="btn btn-secondary text-sm">
              На сайт
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 sm:px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-[10px] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
