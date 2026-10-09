import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getSessionUser } from "@/lib/auth/profile";
import { MVP_SUBJECTS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ErrorRow = {
  id: string;
  timesWrong: number;
  stem: string;
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  emoji: string;
};

type TaskJoin = {
  stem: string;
  topic_id: string;
  topics: { title: string; subject_code: string } | null;
} | null;

async function loadErrors(): Promise<ErrorRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return [];
    const { data } = await supabase
      .from("error_bank")
      .select("id, times_wrong, tasks(stem, topic_id, topics(title, subject_code))")
      .eq("user_id", user.id)
      .eq("resolved", false)
      .order("updated_at", { ascending: false });

    return (data ?? []).flatMap((row) => {
      const task = row.tasks as unknown as TaskJoin;
      if (!task) return [];
      const subject = MVP_SUBJECTS.find((s) => s.code === task.topics?.subject_code);
      return [
        {
          id: row.id,
          timesWrong: row.times_wrong,
          stem: task.stem,
          topicId: task.topic_id,
          topicTitle: task.topics?.title ?? "",
          subjectTitle: subject?.title ?? "",
          emoji: subject?.emoji ?? "📘",
        },
      ];
    });
  } catch {
    return [];
  }
}

export default async function ErrorsPage() {
  const errors = await loadErrors();

  return (
    <PageShell>
      <div className="fade-up flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            😅 Банк ошибок
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
            Повторите сложные задания
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
            Сюда попадают задания, в которых вы ошиблись. Решите их верно — и они исчезнут из списка.
          </p>
        </div>
        <span className={`badge ${errors.length > 0 ? "badge-weak" : "badge-good"}`}>
          {errors.length} не решено
        </span>
      </div>

      {errors.length === 0 ? (
        <div className="surface mt-8 p-8 text-center text-[var(--muted)]">
          <p>🎉 Ошибок пока нет.</p>
          <p className="mt-2 text-sm">Решайте задания в темах — неверные ответы появятся здесь.</p>
          <Link href="/app" className="btn btn-primary mt-5 inline-flex">
            К предметам
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {errors.map((item) => (
            <article key={item.id} className="surface p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <span>
                  {item.emoji} {item.subjectTitle}
                </span>
                <span>·</span>
                <span>{item.topicTitle}</span>
                <span className="badge badge-weak normal-case tracking-normal">
                  ошибок: {item.timesWrong}
                </span>
              </div>
              <p className="mt-3 text-lg font-medium leading-snug">{item.stem}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/app/topics/${item.topicId}`} className="btn btn-primary">
                  🔁 Решить снова
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
