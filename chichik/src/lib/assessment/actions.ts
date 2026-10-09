"use server";

import { revalidatePath } from "next/cache";
import { gradeAndRecord } from "@/lib/assessment/grade";
import type { AnswerInput, SubmitResult } from "@/lib/assessment/types";
import { getSessionUser } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const NOT_CONFIGURED = "Supabase не настроен — проверка недоступна.";
const NETWORK_ERROR = "Ошибка сети или базы. Попробуйте ещё раз.";

function sanitize(answers: AnswerInput[]): AnswerInput[] {
  return answers
    .filter((a) => typeof a?.taskId === "string" && a.taskId.length > 0)
    .map((a) => ({ taskId: a.taskId, answer: String(a.answer ?? "").slice(0, 500) }));
}

export async function submitDiagnostic(
  subjectCode: string,
  answers: AnswerInput[],
): Promise<SubmitResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };

  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return { ok: false, message: "Войдите в аккаунт." };

    const clean = sanitize(answers);
    const { data: allowed } = await supabase
      .from("tasks")
      .select("id, topics!inner(subject_code)")
      .eq("topics.subject_code", subjectCode)
      .in(
        "id",
        clean.map((a) => a.taskId),
      );
    const allowedIds = new Set((allowed ?? []).map((t) => t.id));
    const items = clean.filter((a) => allowedIds.has(a.taskId));
    if (items.length === 0) return { ok: false, message: "Нет заданий для проверки." };

    const review = await gradeAndRecord(supabase, user.id, items, { diagnostic: true });

    revalidatePath("/app", "layout");
    return { ok: true, correctCount: review.filter((r) => r.correct).length, review };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}

export type StartExamResult =
  | { ok: true; attemptId: string; startedAt: string }
  | { ok: false; message: string };

export async function startExamAttempt(examId: string): Promise<StartExamResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };

  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return { ok: false, message: "Войдите в аккаунт." };

    const { data: exam } = await supabase
      .from("exams")
      .select("id, duration_min")
      .eq("id", examId)
      .maybeSingle();
    if (!exam) return { ok: false, message: "Пробник не найден." };

    const { data: open } = await supabase
      .from("exam_attempts")
      .select("id, started_at")
      .eq("user_id", user.id)
      .eq("exam_id", examId)
      .is("finished_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const deadline = open
      ? new Date(open.started_at).getTime() + exam.duration_min * 60_000
      : 0;
    if (open && deadline > Date.now()) {
      return { ok: true, attemptId: open.id, startedAt: open.started_at };
    }

    const { data: created, error } = await supabase
      .from("exam_attempts")
      .insert({ user_id: user.id, exam_id: examId })
      .select("id, started_at")
      .single();
    if (error || !created) return { ok: false, message: NETWORK_ERROR };

    return { ok: true, attemptId: created.id, startedAt: created.started_at };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}

export async function finishExamAttempt(
  attemptId: string,
  answers: AnswerInput[],
): Promise<SubmitResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED };

  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return { ok: false, message: "Войдите в аккаунт." };

    const { data: attempt } = await supabase
      .from("exam_attempts")
      .select("id, exam_id, finished_at")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!attempt) return { ok: false, message: "Попытка не найдена." };

    const resultUrl = `/app/exams/${attempt.exam_id}/result?attempt=${attempt.id}`;
    if (attempt.finished_at) return { ok: true, correctCount: 0, redirectTo: resultUrl };

    const { data: links } = await supabase
      .from("exam_tasks")
      .select("task_id, sort_order")
      .eq("exam_id", attempt.exam_id)
      .order("sort_order");
    const taskIds = (links ?? []).map((l) => l.task_id as string);
    if (taskIds.length === 0) return { ok: false, message: "В пробнике нет заданий." };

    const given = new Map(sanitize(answers).map((a) => [a.taskId, a.answer]));
    const items = taskIds.map((taskId) => ({ taskId, answer: given.get(taskId) ?? "" }));

    const graded = await gradeAndRecord(supabase, user.id, items, { examAttemptId: attempt.id });

    const byTopic = new Map<string, { topicId: string; title: string; correct: number; total: number }>();
    for (const g of graded) {
      const entry = byTopic.get(g.topicId) ?? {
        topicId: g.topicId,
        title: g.topicTitle,
        correct: 0,
        total: 0,
      };
      entry.total += 1;
      if (g.correct) entry.correct += 1;
      byTopic.set(g.topicId, entry);
    }
    const weakTopics = [...byTopic.values()].filter((t) => t.correct / t.total < 0.7);
    const correctCount = graded.filter((g) => g.correct).length;

    await supabase
      .from("exam_attempts")
      .update({
        finished_at: new Date().toISOString(),
        score_raw: correctCount,
        score_max: graded.length,
        weak_topics_json: weakTopics,
      })
      .eq("id", attempt.id)
      .eq("user_id", user.id);

    revalidatePath("/app", "layout");
    return { ok: true, correctCount, redirectTo: resultUrl };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}
