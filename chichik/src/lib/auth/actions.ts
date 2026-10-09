"use server";

import { redirect } from "next/navigation";
import { parseAdminEmails } from "@/lib/auth/admin";
import { MVP_SUBJECT_CODES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  ok?: boolean;
};

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Неверный email или пароль.";
  if (m.includes("already registered")) return "Этот email уже зарегистрирован.";
  if (m.includes("password")) return "Пароль слишком короткий или не подходит.";
  if (m.includes("email")) return "Проверьте формат email.";
  return "Не удалось выполнить действие. Попробуйте ещё раз.";
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase не настроен. Заполните .env.local по образцу .env.example." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Укажите email и пароль." };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
    },
  });

  if (error) return { error: mapAuthError(error.message) };
  if (!data.user) return { error: "Не удалось создать аккаунт." };

  const emails = parseAdminEmails();
  if (emails.length > 0) {
    await supabase.rpc("ensure_admin_role", { allowed_emails: emails });
  }

  if (displayName) {
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", data.user.id);
  }

  redirect("/onboarding");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase не настроен. Заполните .env.local по образцу .env.example." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Укажите email и пароль." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapAuthError(error.message) };

  const emails = parseAdminEmails();
  if (emails.length > 0) {
    await supabase.rpc("ensure_admin_role", { allowed_emails: emails });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", data.user!.id)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? "/app" : "/onboarding");
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function onboardingAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase не настроен." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Войдите в аккаунт." };

  const examTypes = formData.getAll("examType").map(String) as Array<"oge" | "ege">;
  const subjectCodes = formData.getAll("subject").map(String);

  if (examTypes.length === 0) return { error: "Выберите хотя бы один профиль: ОГЭ или ЕГЭ." };
  if (subjectCodes.length === 0) return { error: "Выберите хотя бы один предмет." };

  const allowedSubjects = new Set<string>(MVP_SUBJECT_CODES);
  const validSubjects = subjectCodes.filter((code) => allowedSubjects.has(code));
  if (validSubjects.length === 0) return { error: "Выберите предметы из списка MVP." };

  await supabase.from("user_exam_profiles").delete().eq("user_id", user.id);
  await supabase.from("user_subjects").delete().eq("user_id", user.id);

  const examRows = examTypes.map((exam_type) => ({
    user_id: user.id,
    exam_type,
    enabled: true,
  }));
  const { error: examError } = await supabase.from("user_exam_profiles").insert(examRows);
  if (examError) return { error: "Не удалось сохранить профили экзаменов." };

  const subjectRows = [];
  for (const exam_type of examTypes) {
    for (const subject_code of validSubjects) {
      subjectRows.push({
        user_id: user.id,
        exam_type,
        subject_code,
        enabled: true,
      });
    }
  }
  const { error: subjectError } = await supabase.from("user_subjects").insert(subjectRows);
  if (subjectError) return { error: "Не удалось сохранить предметы." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);
  if (profileError) return { error: "Не удалось завершить онбординг." };

  redirect("/app");
}
