import { cache } from "react";
import type { GradedItem, RunnerTask, TaskType } from "@/lib/assessment/types";
import { getSessionUser } from "@/lib/auth/profile";
import { MVP_SUBJECT_CODES } from "@/lib/constants";
import type { ExamType } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const DIAGNOSTIC_TASKS_PER_TOPIC = 2;

type TaskRow = {
  id: string;
  topic_id: string;
  task_type: TaskType;
  stem: string;
  options_json: unknown;
  sort_order: number;
};

function toRunnerTask(row: TaskRow, topicTitle: string): RunnerTask {
  return {
    id: row.id,
    taskType: row.task_type,
    stem: row.stem,
    options: Array.isArray(row.options_json) ? row.options_json.map(String) : undefined,
    topicTitle,
  };
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type TopicMasteryRow = {
  id: string;
  title: string;
  examType: ExamType;
  mastery: number | null;
  lastDiagnosedAt: string | null;
};

export async function getSubjectMasteryMap(subjectCode: string): Promise<TopicMasteryRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { supabase, user } = await getSessionUser();
  if (!user) return [];

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, exam_type, sort_order")
    .eq("subject_code", subjectCode)
    .order("sort_order");
  if (!topics?.length) return [];

  const { data: mastery } = await supabase
    .from("topic_mastery")
    .select("topic_id, mastery, last_diagnosed_at")
    .eq("user_id", user.id)
    .in(
      "topic_id",
      topics.map((t) => t.id),
    );
  const byTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));

  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    examType: t.exam_type as ExamType,
    mastery: byTopic.get(t.id)?.mastery ?? null,
    lastDiagnosedAt: byTopic.get(t.id)?.last_diagnosed_at ?? null,
  }));
}

export async function getDiagnosticTasks(subjectCode: string): Promise<RunnerTask[]> {
  if (!isSupabaseConfigured()) return [];
  const { supabase } = await getSessionUser();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, sort_order")
    .eq("subject_code", subjectCode)
    .order("sort_order");
  if (!topics?.length) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, topic_id, task_type, stem, options_json, sort_order")
    .in(
      "topic_id",
      topics.map((t) => t.id),
    );

  const byTopic = new Map<string, TaskRow[]>();
  for (const task of (tasks ?? []) as TaskRow[]) {
    const list = byTopic.get(task.topic_id) ?? [];
    list.push(task);
    byTopic.set(task.topic_id, list);
  }

  return topics.flatMap((topic) =>
    shuffle(byTopic.get(topic.id) ?? [])
      .slice(0, DIAGNOSTIC_TASKS_PER_TOPIC)
      .map((task) => toRunnerTask(task, topic.title)),
  );
}

export type ExamListItem = {
  id: string;
  title: string;
  subjectCode: string;
  examType: ExamType;
  durationMin: number;
  tasksCount: number;
  best: { scoreRaw: number; scoreMax: number } | null;
};

export async function listExams(): Promise<ExamListItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { supabase, user } = await getSessionUser();
  if (!user) return [];

  const [{ data: exams }, { data: attempts }] = await Promise.all([
    supabase
      .from("exams")
      .select("id, title, subject_code, exam_type, duration_min, exam_tasks(count)")
      .in("subject_code", [...MVP_SUBJECT_CODES])
      .order("created_at"),
    supabase
      .from("exam_attempts")
      .select("exam_id, score_raw, score_max")
      .eq("user_id", user.id)
      .not("finished_at", "is", null),
  ]);

  const best = new Map<string, { scoreRaw: number; scoreMax: number }>();
  for (const a of attempts ?? []) {
    const prev = best.get(a.exam_id);
    if (!prev || a.score_raw > prev.scoreRaw) {
      best.set(a.exam_id, { scoreRaw: a.score_raw, scoreMax: a.score_max });
    }
  }

  return (exams ?? []).map((e) => {
    const countRow = (e.exam_tasks as unknown as { count: number }[] | null)?.[0];
    return {
      id: e.id,
      title: e.title,
      subjectCode: e.subject_code,
      examType: e.exam_type as ExamType,
      durationMin: e.duration_min,
      tasksCount: countRow?.count ?? 0,
      best: best.get(e.id) ?? null,
    };
  });
}

export type ExamWithTasks = {
  id: string;
  title: string;
  subjectCode: string;
  examType: ExamType;
  durationMin: number;
  tasks: RunnerTask[];
};

export const getExamWithTasks = cache(async (examId: string): Promise<ExamWithTasks | null> => {
  if (!isSupabaseConfigured()) return null;
  const { supabase } = await getSessionUser();

  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, subject_code, exam_type, duration_min")
    .eq("id", examId)
    .maybeSingle();
  if (!exam) return null;

  const { data: links } = await supabase
    .from("exam_tasks")
    .select(
      "sort_order, tasks(id, topic_id, task_type, stem, options_json, sort_order, topics(title))",
    )
    .eq("exam_id", examId)
    .order("sort_order");

  type LinkRow = { tasks: (TaskRow & { topics: { title: string } | null }) | null };
  const tasks = ((links ?? []) as unknown as LinkRow[]).flatMap((link) =>
    link.tasks ? [toRunnerTask(link.tasks, link.tasks.topics?.title ?? "")] : [],
  );

  return {
    id: exam.id,
    title: exam.title,
    subjectCode: exam.subject_code,
    examType: exam.exam_type as ExamType,
    durationMin: exam.duration_min,
    tasks,
  };
});

export type ExamResult = {
  attemptId: string;
  startedAt: string;
  finishedAt: string | null;
  scoreRaw: number;
  scoreMax: number;
  weakTopics: { topicId: string; title: string; correct: number; total: number }[];
  review: GradedItem[];
};

export async function getExamResult(examId: string, attemptId?: string): Promise<ExamResult | null> {
  if (!isSupabaseConfigured()) return null;
  const { supabase, user } = await getSessionUser();
  if (!user) return null;

  let query = supabase
    .from("exam_attempts")
    .select("id, started_at, finished_at, score_raw, score_max, weak_topics_json")
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .not("finished_at", "is", null);
  if (attemptId) query = query.eq("id", attemptId);
  const { data: attempt } = await query
    .order("finished_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!attempt) return null;

  const { data: rows } = await supabase
    .from("attempts")
    .select(
      "user_answer, is_correct, tasks(id, topic_id, stem, answer_key, solution_md, topics(title))",
    )
    .eq("exam_attempt_id", attempt.id)
    .order("created_at");

  type Row = {
    user_answer: string;
    is_correct: boolean;
    tasks: {
      id: string;
      topic_id: string;
      stem: string;
      answer_key: string;
      solution_md: string;
      topics: { title: string } | null;
    } | null;
  };

  const review: GradedItem[] = ((rows ?? []) as unknown as Row[]).flatMap((r) =>
    r.tasks
      ? [
          {
            taskId: r.tasks.id,
            topicId: r.tasks.topic_id,
            topicTitle: r.tasks.topics?.title ?? "",
            stem: r.tasks.stem,
            userAnswer: r.user_answer,
            correct: r.is_correct,
            answerKey: r.tasks.answer_key,
            solution: r.tasks.solution_md,
          },
        ]
      : [],
  );

  return {
    attemptId: attempt.id,
    startedAt: attempt.started_at,
    finishedAt: attempt.finished_at,
    scoreRaw: attempt.score_raw,
    scoreMax: attempt.score_max,
    weakTopics: Array.isArray(attempt.weak_topics_json)
      ? (attempt.weak_topics_json as ExamResult["weakTopics"])
      : [],
    review,
  };
}
