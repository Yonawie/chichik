import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Кракозябры вроде «Р§РёС‡РёРє» — UTF-8, записанный/прочитанный с неверной кодировкой */
function looksMojibake(text: string): boolean {
  return /Р§Рё|РџРѕРґ|РќР°С‡|С‚РµРѕСЂ/.test(text);
}

async function getLandingText(key: string, fallback: string) {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_content")
      .select("value_text")
      .eq("key", key)
      .maybeSingle();
    const value = data?.value_text?.trim();
    if (!value || looksMojibake(value)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [heroTitle, heroSubtitle, ctaPrimary] = await Promise.all([
    getLandingText("landing.hero_title", "Чичик"),
    getLandingText(
      "landing.hero_subtitle",
      "Подготовка к ОГЭ и ЕГЭ: теория, практика, диагностика и пробники.",
    ),
    getLandingText("landing.cta_primary", "Создать аккаунт"),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/images/hero-study.jpg"
          alt="Рабочее место для подготовки к экзаменам"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,30,25,0.88)] via-[rgba(12,30,25,0.62)] to-[rgba(12,30,25,0.28)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,30,25,0.55)] via-transparent to-[rgba(12,30,25,0.25)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <SiteHeader variant="hero" />

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-16 pt-8 sm:px-8">
            <div className="fade-up max-w-2xl text-white">
              <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
                {heroTitle}
              </h1>
              <p className="fade-up-delay mt-5 max-w-lg text-lg leading-relaxed text-white/85 sm:text-xl">
                {heroSubtitle}
              </p>
              <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary">
                  {ctaPrimary}
                </Link>
                <Link
                  href="/app"
                  className="btn border border-white/35 bg-white/10 text-white hover:bg-white/20"
                >
                  Открыть кабинет
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-3">
          {[
            {
              title: "📚 Темы и задания",
              text: "Русский, математика (база), обществознание и химия — темы ОГЭ и ЕГЭ.",
              image: "/images/subject-russian.jpg",
            },
            {
              title: "🎯 Диагностика",
              text: "Карта тем: 😕 слабо / 🙂 средне / 😄 хорошо. Сразу видно, что подтянуть.",
              image: "/images/subject-math.jpg",
            },
            {
              title: "⏱ Пробники",
              text: "Варианты с таймером и разбором — формат ближе к реальному экзамену.",
              image: "/images/subject-chemistry.jpg",
            },
          ].map((item) => (
            <article key={item.title} className="surface overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative aspect-[16/10]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl font-semibold text-[var(--accent-ink)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-6 text-center text-sm text-[var(--muted)] sm:px-8">
        Чичик · подготовка к ОГЭ и ЕГЭ
      </footer>
    </div>
  );
}
