import type { AnswerInput, GradedItem, TaskType } from "@/lib/assessment/types";
import { checkAnswer } from "@/lib/practice/check";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type TaskRow = {
  id: string;
  topic_id: string;
  task_type: TaskType;
  stem: string;
  answer_key: string;
  solution_md: string;
  topics: { title: string } | null;
};

const MASTERY_WINDOW = 10;

/**
 * Checks answers on the server, records attempts, updates error bank and topic mastery.
 * Answer keys never leave the server before grading.
 */
export async function gradeAndRecord(
  supabase: Supabase,
  userId: string,
  items: AnswerInput[],
  opts: { examAttemptId?: string; diagnostic?: boolean } = {},
): Promise<GradedItem[]> {
  const ids = [...new Set(items.map((i) => i.taskId))];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("id, topic_id, task_type, stem, answer_key, solution_md, topics(title)")
    .in("id", ids);
  if (error) throw error;

  const tasks = new Map(((data ?? []) as unknown as TaskRow[]).map((t) => [t.id, t]));

  const graded: GradedItem[] = items.flatMap((item) => {
    const task = tasks.get(item.taskId);
    if (!task) return [];
    const answer = item.answer.trim();
    return [
      {
        taskId: task.id,
        topicId: task.topic_id,
        topicTitle: task.topics?.title ?? "",
        stem: task.stem,
        userAnswer: answer,
        correct: answer ? checkAnswer(task.task_type, answer, task.answer_key) : false,
        answerKey: task.answer_key,
        solution: task.solution_md,
      },
    ];
  });
  if (graded.length === 0) return [];

  const { error: attemptsError } = await supabase.from("attempts").insert(
    graded.map((g) => ({
      user_id: userId,
      task_id: g.taskId,
      user_answer: g.userAnswer,
      is_correct: g.correct,
      exam_attempt_id: opts.examAttemptId ?? null,
    })),
  );
  if (attemptsError) throw attemptsError;

  await updateErrorBank(supabase, userId, graded);
  await updateMastery(
    supabase,
    userId,
    [...new Set(graded.map((g) => g.topicId))],
    Boolean(opts.diagnostic),
  );

  return graded;
}

async function updateErrorBank(supabase: Supabase, userId: string, graded: GradedItem[]) {
  const now = new Date().toISOString();
  const wrongIds = [...new Set(graded.filter((g) => !g.correct).map((g) => g.taskId))];
  const rightIds = [...new Set(graded.filter((g) => g.correct).map((g) => g.taskId))].filter(
    (id) => !wrongIds.includes(id),
  );

  if (wrongIds.length > 0) {
    const { data: existing } = await supabase
      .from("error_bank")
      .select("task_id, times_wrong")
      .eq("user_id", userId)
      .in("task_id", wrongIds);
    const prev = new Map((existing ?? []).map((e) => [e.task_id, e.times_wrong as number]));

    await supabase.from("error_bank").upsert(
      wrongIds.map((taskId) => ({
        user_id: userId,
        task_id: taskId,
        times_wrong: (prev.get(taskId) ?? 0) + 1,
        resolved: false,
        updated_at: now,
      })),
      { onConflict: "user_id,task_id" },
    );
  }

  if (rightIds.length > 0) {
    await supabase
      .from("error_bank")
      .update({ resolved: true, updated_at: now })
      .eq("user_id", userId)
      .in("task_id", rightIds);
  }
}

async function updateMastery(
  supabase: Supabase,
  userId: string,
  topicIds: string[],
  diagnostic: boolean,
) {
  if (topicIds.length === 0) return;

  const { data: topicTasks } = await supabase
    .from("tasks")
    .select("id, topic_id")
    .in("topic_id", topicIds);
  const topicByTask = new Map((topicTasks ?? []).map((t) => [t.id, t.topic_id as string]));
  if (topicByTask.size === 0) return;

  const { data: attempts } = await supabase
    .from("attempts")
    .select("task_id, is_correct")
    .eq("user_id", userId)
    .in("task_id", [...topicByTask.keys()])
    .order("created_at", { ascending: false })
    .limit(MASTERY_WINDOW * topicIds.length * 3);

  const recent = new Map<string, boolean[]>();
  for (const a of attempts ?? []) {
    const topicId = topicByTask.get(a.task_id);
    if (!topicId) continue;
    const list = recent.get(topicId) ?? [];
    if (list.length < MASTERY_WINDOW) list.push(Boolean(a.is_correct));
    recent.set(topicId, list);
  }

  const now = new Date().toISOString();
  const rows = [...recent.entries()].map(([topicId, list]) => ({
    user_id: userId,
    topic_id: topicId,
    mastery: Math.round((100 * list.filter(Boolean).length) / list.length),
    updated_at: now,
    ...(diagnostic ? { last_diagnosed_at: now } : {}),
  }));
  if (rows.length > 0) {
    await supabase.from("topic_mastery").upsert(rows, { onConflict: "user_id,topic_id" });
  }
}
