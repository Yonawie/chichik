import Image from "next/image";
import Link from "next/link";
import { MasteryBadge } from "@/components/MasteryBadge";
import { PageShell } from "@/components/PageShell";
import { listSubjects } from "@/lib/catalog";
import { getSessionUser } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function countOpenErrors(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("error_bank")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("resolved", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AppHomePage() {
  const [subjects, errorCount] = await Promise.all([listSubjects(), countOpenErrors()]);

  const fromDb = subjects.some((s) => s.source === "db");

  return (
    <PageShell>
      <div className="fade-up overflow-hidden surface">
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          <div className="p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Кабинет ученика
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
              С возвращением в Чичик
            </h1>
            <p className="mt-2 max-w-xl text-[var(--ink-soft)]">
              Решайте задания (+5 💠 чириков), покупайте еду в магазине и кормите Чичика.
            </p>
            {!fromDb ? (
              <p className="mt-3 text-sm text-[var(--medium)]">
                Контент из макета. Выполните в Supabase файл content-full.sql — появятся темы ОГЭ и ЕГЭ.
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/app/diagnostics" className="btn btn-primary">
                Пройти диагностику
              </Link>
              <Link href="/app/shop" className="btn btn-secondary">
                🛒 Магазин
              </Link>
              <Link href="/app/pet" className="btn btn-secondary">
                🐬 К Чичику
              </Link>
            </div>
          </div>
          <div className="relative min-h-44 md:min-h-full">
            <Image
              src="/images/hero-study.jpg"
              alt="Подготовка к экзаменам"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="surface-flat p-4">
          <p className="text-sm text-[var(--muted)]">😅 Ошибки в банке</p>
          <p className="mt-1 font-display text-3xl font-semibold">{errorCount}</p>
        </div>
        <div className="surface-flat p-4">
          <p className="text-sm text-[var(--muted)]">📚 Предметы</p>
          <p className="mt-1 font-display text-3xl font-semibold">{subjects.length}</p>
        </div>
        <div className="surface-flat p-4">
          <p className="text-sm text-[var(--muted)]">🎓 Профили</p>
          <p className="mt-1 font-display text-3xl font-semibold">ОГЭ + ЕГЭ</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-[var(--accent-ink)]">
            📚 Предметы
          </h2>
          <Link href="/app/exams" className="text-sm font-semibold text-[var(--accent)] hover:underline">
            К пробникам
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <Link
              key={subject.code}
              href={`/app/subjects/${subject.code}`}
              className="surface group overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="relative aspect-[21/9]">
                <Image
                  src={subject.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold group-hover:text-[var(--accent)]">
                      {subject.emoji} {subject.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{subject.short}</p>
                    <p className="mt-2 text-xs font-semibold text-[var(--accent)]">
                      {subject.examTypes.map((t) => (t === "oge" ? "ОГЭ" : "ЕГЭ")).join(" · ")}
                    </p>
                  </div>
                  <MasteryBadge mastery={subject.mastery} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
                    <span>
                      Темы: {subject.topicsDone}/{subject.topicsTotal}
                    </span>
                    <span>{subject.mastery}%</span>
                  </div>
                  <div className="progress">
                    <span style={{ width: `${subject.mastery}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
