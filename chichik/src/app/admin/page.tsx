import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [subjects, topics, tasks, exams] = await Promise.all([
    supabase.from("subjects").select("code", { count: "exact", head: true }),
    supabase.from("topics").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase.from("exams").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Предметы", count: subjects.count ?? 0, href: "/admin/subjects" },
    { label: "Темы", count: topics.count ?? 0, href: "/admin/topics" },
    { label: "Задания", count: tasks.count ?? 0, href: "/admin/tasks" },
    { label: "Пробники", count: exams.count ?? 0, href: "/admin/exams" },
  ];

  return (
    <AdminShell
      title="Обзор"
      description="Управление контентом. Сохранили — сразу видно ученикам."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="surface p-5 hover:border-[var(--accent)]">
            <p className="text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--accent-ink)]">
              {card.count}
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
