import { cache } from "react";
import { MVP_SUBJECT_CODES, MVP_SUBJECTS, subjectExamTypes } from "@/lib/constants";

function looksMojibake(text: string): boolean {
  return /Р§Рё|РџРѕРґ|РњР°С‚|Р СѓСЃ|РћР±С‰|РҐРёРј|С‚РµРѕСЂ/.test(text);
}
import {
  examTypeLabel,
  getSubject as getMockSubject,
  getTopic as getMockTopic,
  getTopicsBySubjectGrouped as getMockTopicsGrouped,
  sampleTasks,
  subjects as mockSubjects,
  type ExamType,
  type Subject,
  type Topic,
} from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CatalogSubject = Subject & { source: "db" | "mock" };

export type CatalogTopic = Topic & {
  theoryMd: string;
  source: "db" | "mock";
};

export type CatalogTask = {
  id: string;
  topicId: string;
  taskType: "single" | "multi" | "short" | "numeric";
  stem: string;
  options?: string[];
  difficulty: 1 | 2 | 3;
  source: "db" | "mock";
};

const SUBJECT_IMAGES: Record<string, string> = {
  russian: "/images/subject-russian.jpg",
  math_basic: "/images/subject-math.jpg",
  social: "/images/subject-social.jpg",
  chemistry: "/images/subject-chemistry.jpg",
};

export function subjectImage(code: string): string {
  return SUBJECT_IMAGES[code] ?? "/images/hero-study.jpg";
}

function previewFromMd(md: string): string {
  const line = md
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 0);
  return line ?? "Теория по теме";
}

export { examTypeLabel };

export const listSubjects = cache(async (): Promise<CatalogSubject[]> => {
  if (!isSupabaseConfigured()) {
    return mockSubjects.map((s) => ({ ...s, source: "mock" as const }));
  }

  try {
    const supabase = await createClient();
    const [{ data, error }, { data: topics }, { data: mastery }] = await Promise.all([
      supabase
        .from("subjects")
        .select("code, title, short_description, emoji, sort_order")
        .in("code", [...MVP_SUBJECT_CODES])
        .order("sort_order"),
      supabase
        .from("topics")
        .select("id, subject_code")
        .in("subject_code", [...MVP_SUBJECT_CODES]),
      supabase.from("topic_mastery").select("topic_id, mastery"),
    ]);

    if (error || !data?.length) {
      return mockSubjects.map((s) => ({ ...s, source: "mock" as const }));
    }

    const topicIdsBySubject = new Map<string, string[]>();
    for (const t of topics ?? []) {
      const list = topicIdsBySubject.get(t.subject_code) ?? [];
      list.push(t.id);
      topicIdsBySubject.set(t.subject_code, list);
    }

    const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m.mastery]));

    return data.map((row) => {
      const ids = topicIdsBySubject.get(row.code) ?? [];
      const values = ids.map((id) => masteryByTopic.get(id)).filter((v): v is number => v != null);
      const avg =
        values.length > 0
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : 0;
      const fallback = MVP_SUBJECTS.find((s) => s.code === row.code);
      const title =
        looksMojibake(row.title || "") || !row.title
          ? (fallback?.title ?? row.title)
          : row.title;
      const short =
        looksMojibake(row.short_description || "") || !row.short_description
          ? (fallback?.short ?? row.short_description ?? "")
          : row.short_description;
      const emoji =
        !row.emoji || row.emoji.includes("Р") || row.emoji.length > 4
          ? (fallback?.emoji ?? "📘")
          : row.emoji;
      return {
        code: row.code,
        title,
        short,
        emoji,
        examTypes: subjectExamTypes(row.code),
        mastery: avg,
        topicsDone: values.filter((v) => v >= 40).length,
        topicsTotal: Math.max(ids.length, 1),
        image: SUBJECT_IMAGES[row.code] ?? "/images/hero-study.jpg",
        source: "db" as const,
      };
    });
  } catch {
    return mockSubjects.map((s) => ({ ...s, source: "mock" as const }));
  }
});

export async function getCatalogSubject(code: string): Promise<CatalogSubject | null> {
  const all = await listSubjects();
  return all.find((s) => s.code === code) ?? null;
}

export async function getTopicsGrouped(
  subjectCode: string,
): Promise<{ oge: CatalogTopic[]; ege: CatalogTopic[] }> {
  if (!isSupabaseConfigured()) {
    const grouped = getMockTopicsGrouped(subjectCode);
    return {
      oge: grouped.oge.map((t) => ({
        ...t,
        theoryMd: t.theoryPreview,
        source: "mock" as const,
      })),
      ege: grouped.ege.map((t) => ({
        ...t,
        theoryMd: t.theoryPreview,
        source: "mock" as const,
      })),
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("topics")
      .select("id, subject_code, exam_type, title, theory_md, sort_order")
      .eq("subject_code", subjectCode)
      .order("sort_order");

    if (error || !data?.length) {
      const grouped = getMockTopicsGrouped(subjectCode);
      return {
        oge: grouped.oge.map((t) => ({
          ...t,
          theoryMd: t.theoryPreview,
          source: "mock" as const,
        })),
        ege: grouped.ege.map((t) => ({
          ...t,
          theoryMd: t.theoryPreview,
          source: "mock" as const,
        })),
      };
    }

    const topicIds = data.map((t) => t.id);
    const [{ data: taskRows }, { data: masteryRows }] = await Promise.all([
      supabase.from("tasks").select("id, topic_id").in("topic_id", topicIds),
      supabase.from("topic_mastery").select("topic_id, mastery").in("topic_id", topicIds),
    ]);

    const taskCount = new Map<string, number>();
    for (const t of taskRows ?? []) {
      taskCount.set(t.topic_id, (taskCount.get(t.topic_id) ?? 0) + 1);
    }
    const masteryMap = new Map((masteryRows ?? []).map((m) => [m.topic_id, m.mastery]));

    const mapped: CatalogTopic[] = data.map((row) => ({
      id: row.id,
      subjectCode: row.subject_code,
      examType: row.exam_type as ExamType,
      title: row.title,
      emoji: "📘",
      theoryPreview: previewFromMd(row.theory_md || ""),
      theoryMd: row.theory_md || "",
      mastery: masteryMap.get(row.id) ?? 0,
      tasksCount: taskCount.get(row.id) ?? 0,
      source: "db" as const,
    }));

    return {
      oge: mapped.filter((t) => t.examType === "oge"),
      ege: mapped.filter((t) => t.examType === "ege"),
    };
  } catch {
    const grouped = getMockTopicsGrouped(subjectCode);
    return {
      oge: grouped.oge.map((t) => ({
        ...t,
        theoryMd: t.theoryPreview,
        source: "mock" as const,
      })),
      ege: grouped.ege.map((t) => ({
        ...t,
        theoryMd: t.theoryPreview,
        source: "mock" as const,
      })),
    };
  }
}

export async function getCatalogTopic(topicId: string): Promise<CatalogTopic | null> {
  if (!isSupabaseConfigured()) {
    const t = getMockTopic(topicId);
    if (!t) return null;
    return { ...t, theoryMd: t.theoryPreview, source: "mock" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("topics")
      .select("id, subject_code, exam_type, title, theory_md, sort_order")
      .eq("id", topicId)
      .maybeSingle();

    if (error || !data) {
      const t = getMockTopic(topicId);
      if (!t) return null;
      return { ...t, theoryMd: t.theoryPreview, source: "mock" };
    }

    const [{ count }, { data: mastery }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("topic_id", topicId),
      supabase
        .from("topic_mastery")
        .select("mastery")
        .eq("topic_id", topicId)
        .maybeSingle(),
    ]);

    return {
      id: data.id,
      subjectCode: data.subject_code,
      examType: data.exam_type as ExamType,
      title: data.title,
      emoji: "📘",
      theoryPreview: previewFromMd(data.theory_md || ""),
      theoryMd: data.theory_md || "",
      mastery: mastery?.mastery ?? 0,
      tasksCount: count ?? 0,
      source: "db",
    };
  } catch {
    const t = getMockTopic(topicId);
    if (!t) return null;
    return { ...t, theoryMd: t.theoryPreview, source: "mock" };
  }
}

export async function listTasksForTopic(topicId: string): Promise<CatalogTask[]> {
  if (!isSupabaseConfigured()) {
    return sampleTasks
      .filter((t) => t.topicId === topicId)
      .map((t) => ({
        id: t.id,
        topicId: t.topicId,
        taskType: t.options ? ("single" as const) : ("short" as const),
        stem: t.stem,
        options: t.options,
        difficulty: t.difficulty,
        source: "mock" as const,
      }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("id, topic_id, task_type, stem, options_json, difficulty, sort_order")
      .eq("topic_id", topicId)
      .order("sort_order");

    if (error || !data?.length) {
      return sampleTasks
        .filter((t) => t.topicId === topicId)
        .map((t) => ({
          id: t.id,
          topicId: t.topicId,
          taskType: t.options ? ("single" as const) : ("short" as const),
          stem: t.stem,
          options: t.options,
          difficulty: t.difficulty,
          source: "mock" as const,
        }));
    }

    return data.map((row) => {
      const options = Array.isArray(row.options_json)
        ? (row.options_json as unknown[]).map(String)
        : undefined;
      return {
        id: row.id,
        topicId: row.topic_id,
        taskType: row.task_type as CatalogTask["taskType"],
        stem: row.stem,
        options,
        difficulty: (row.difficulty ?? 1) as 1 | 2 | 3,
        source: "db" as const,
      };
    });
  } catch {
    return [];
  }
}

export function getMockSubjectFallback(code: string) {
  return getMockSubject(code);
}
