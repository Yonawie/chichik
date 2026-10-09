"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { subjectExamTypes } from "@/lib/constants";

export type AdminActionState = { error?: string; ok?: boolean };

async function guard() {
  const result = await requireAdmin();
  if (!result.ok || !result.supabase) {
    return { error: "Недостаточно прав администратора." as const, result: null };
  }
  return { error: null, result };
}

export async function upsertSubjectAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };

  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const short_description = String(formData.get("short_description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "📘").trim() || "📘";
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;

  if (!code || !title) return { error: "Укажите код и название предмета." };

  const { error: dbError } = await result.supabase.from("subjects").upsert({
    code,
    title,
    short_description,
    emoji,
    sort_order,
    exam_types: subjectExamTypes(code),
  });

  if (dbError) return { error: "Не удалось сохранить предмет." };
  revalidatePath("/admin/subjects");
  revalidatePath("/app");
  return { ok: true };
}

export async function upsertTopicAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };

  const id = String(formData.get("id") ?? "").trim();
  const subject_code = String(formData.get("subject_code") ?? "").trim();
  const exam_type = String(formData.get("exam_type") ?? "ege").trim();
  const title = String(formData.get("title") ?? "").trim();
  const theory_md = String(formData.get("theory_md") ?? "");
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;

  if (!subject_code || !title) return { error: "Укажите предмет и название темы." };

  const payload = { subject_code, exam_type, title, theory_md, sort_order };
  const { error: dbError } = id
    ? await result.supabase.from("topics").update(payload).eq("id", id)
    : await result.supabase.from("topics").insert(payload);

  if (dbError) return { error: "Не удалось сохранить тему." };
  revalidatePath("/admin/topics");
  revalidatePath("/app");
  return { ok: true };
}

export async function upsertTaskAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };

  const id = String(formData.get("id") ?? "").trim();
  const topic_id = String(formData.get("topic_id") ?? "").trim();
  const task_type = String(formData.get("task_type") ?? "single").trim();
  const stem = String(formData.get("stem") ?? "").trim();
  const answer_key = String(formData.get("answer_key") ?? "").trim();
  const solution_md = String(formData.get("solution_md") ?? "");
  const difficulty = Number(formData.get("difficulty") ?? 1) || 1;
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;
  const optionsRaw = String(formData.get("options") ?? "").trim();

  if (!topic_id || !stem || !answer_key) {
    return { error: "Укажите тему, условие и правильный ответ." };
  }

  let options_json = null;
  if (optionsRaw) {
    options_json = optionsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const payload = {
    topic_id,
    task_type,
    stem,
    answer_key,
    solution_md,
    difficulty,
    sort_order,
    options_json,
  };

  const { error: dbError } = id
    ? await result.supabase.from("tasks").update(payload).eq("id", id)
    : await result.supabase.from("tasks").insert(payload);

  if (dbError) return { error: "Не удалось сохранить задание." };
  revalidatePath("/admin/tasks");
  return { ok: true };
}

export async function upsertExamAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };

  const id = String(formData.get("id") ?? "").trim();
  const subject_code = String(formData.get("subject_code") ?? "").trim();
  const exam_type = String(formData.get("exam_type") ?? "ege").trim();
  const title = String(formData.get("title") ?? "").trim();
  const duration_min = Number(formData.get("duration_min") ?? 40) || 40;
  const taskIds = String(formData.get("task_ids") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!subject_code || !title) return { error: "Укажите предмет и название пробника." };

  let examId = id;
  if (id) {
    const { error: dbError } = await result.supabase
      .from("exams")
      .update({ subject_code, exam_type, title, duration_min })
      .eq("id", id);
    if (dbError) return { error: "Не удалось обновить пробник." };
  } else {
    const { data, error: dbError } = await result.supabase
      .from("exams")
      .insert({ subject_code, exam_type, title, duration_min })
      .select("id")
      .single();
    if (dbError || !data) return { error: "Не удалось создать пробник." };
    examId = data.id;
  }

  await result.supabase.from("exam_tasks").delete().eq("exam_id", examId);
  if (taskIds.length > 0) {
    const rows = taskIds.map((task_id, index) => ({
      exam_id: examId,
      task_id,
      sort_order: index + 1,
    }));
    const { error: linkError } = await result.supabase.from("exam_tasks").insert(rows);
    if (linkError) return { error: "Пробник сохранён, но не удалось привязать задания." };
  }

  revalidatePath("/admin/exams");
  revalidatePath("/app/exams");
  return { ok: true };
}

export async function upsertSiteContentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };

  const key = String(formData.get("key") ?? "").trim();
  const value_text = String(formData.get("value_text") ?? "");
  if (!key) return { error: "Укажите ключ." };

  const { error: dbError } = await result.supabase.from("site_content").upsert({
    key,
    value_text,
    updated_at: new Date().toISOString(),
    updated_by: result.user!.id,
  });

  if (dbError) return { error: "Не удалось сохранить текст." };
  revalidatePath("/admin/site");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteSubjectAction(code: string): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };
  const trimmed = code.trim();
  if (!trimmed) return { error: "Не указан код предмета." };

  const { error: dbError } = await result.supabase.from("subjects").delete().eq("code", trimmed);
  if (dbError) return { error: "Не удалось удалить предмет (возможно, есть связанные данные)." };
  revalidatePath("/admin/subjects");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteTopicAction(id: string): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };
  if (!id.trim()) return { error: "Не указан id темы." };

  const { error: dbError } = await result.supabase.from("topics").delete().eq("id", id);
  if (dbError) return { error: "Не удалось удалить тему." };
  revalidatePath("/admin/topics");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteTaskAction(id: string): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };
  if (!id.trim()) return { error: "Не указан id задания." };

  const { error: dbError } = await result.supabase.from("tasks").delete().eq("id", id);
  if (dbError) return { error: "Не удалось удалить задание." };
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/exams");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteExamAction(id: string): Promise<AdminActionState> {
  const { error, result } = await guard();
  if (error || !result) return { error: error ?? "Ошибка доступа." };
  if (!id.trim()) return { error: "Не указан id пробника." };

  const { error: dbError } = await result.supabase.from("exams").delete().eq("id", id);
  if (dbError) return { error: "Не удалось удалить пробник." };
  revalidatePath("/admin/exams");
  revalidatePath("/app/exams");
  return { ok: true };
}
