"use server";

import { revalidatePath } from "next/cache";
import { gradeAndRecord } from "@/lib/assessment/grade";
import { getSessionUser } from "@/lib/auth/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PracticeResult = {
  ok: boolean;
  correct?: boolean;
  message: string;
  solution?: string;
};

export async function submitPracticeAnswer(
  _prev: PracticeResult | null,
  formData: FormData,
): Promise<PracticeResult> {
  const taskId = String(formData.get("taskId") ?? "").trim();
  const topicId = String(formData.get("topicId") ?? "").trim();
  const userAnswer = formData.getAll("answer").map(String).join(";");

  if (!taskId) return { ok: false, message: "Не указано задание." };
  if (!userAnswer.trim()) return { ok: false, message: "Введите или выберите ответ." };

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase не настроен — автопроверка недоступна. Заполните .env.local.",
    };
  }

  try {
    const { supabase, user } = await getSessionUser();
    if (!user) return { ok: false, message: "Войдите в аккаунт." };

    const [result] = await gradeAndRecord(supabase, user.id, [{ taskId, answer: userAnswer }]);
    if (!result) return { ok: false, message: "Задание не найдено в базе." };

    revalidatePath(`/app/topics/${topicId || result.topicId}`);
    revalidatePath("/app", "layout");

    return {
      ok: true,
      correct: result.correct,
      message: result.correct ? "Верно! Так держать." : "Пока неверно. Смотрите разбор.",
      solution: result.solution || undefined,
    };
  } catch {
    return { ok: false, message: "Ошибка сети или базы. Попробуйте ещё раз." };
  }
}
