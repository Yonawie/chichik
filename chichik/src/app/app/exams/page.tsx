import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { listExams, type ExamListItem } from "@/lib/assessment/queries";
import { examTypeLabel, subjectImage } from "@/lib/catalog";
import { MVP_SUBJECTS, subjectExamTypes } from "@/lib/constants";
import type { ExamType } from "@/lib/mock-data";

function ExamCard({ exam }: { exam: ExamListItem }) {
  const subject = MVP_SUBJECTS.find((s) => s.code === exam.subjectCode);
  return (
    <Link
      href={`/app/exams/${exam.id}`}
      className="surface group overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/7]">
        <Image
          src={subjectImage(exam.subjectCode)}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {examTypeLabel(exam.examType)} · {subject?.title}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          {subject?.emoji} {exam.title}
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          {exam.tasksCount} заданий · {exam.durationMin} минут
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--accent)]">Открыть пробник →</span>
          {exam.best ? (
            <span className="badge bg-[var(--accent-soft)] text-[var(--accent-ink)]">
              Лучший: {exam.best.scoreRaw} / {exam.best.scoreMax}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function MissingExamCard({ subjectCode, examType }: { subjectCode: string; examType: ExamType }) {
  const subject = MVP_SUBJECTS.find((s) => s.code === subjectCode);
  return (
    <div className="surface overflow-hidden opacity-75">
      <div className="relative aspect-[16/7] grayscale">
        <Image
          src={subjectImage(subjectCode)}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {examTypeLabel(examType)} · {subject?.title}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          {subject?.emoji} Пробник {examTypeLabel(examType)}: {subject?.title.toLowerCase()}
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Вариант ещё не собран — его можно добавить в админке.
        </p>
      </div>
    </div>
  );
}

function ExamSection({
  title,
  examType,
  exams,
}: {
  title: string;
  examType: ExamType;
  exams: ExamListItem[];
}) {
  const missing = MVP_SUBJECTS.filter(
    (s) => s.examTypes.includes(examType) && !exams.some((e) => e.subjectCode === s.code),
  );
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-2xl font-semibold text-[var(--accent-ink)]">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
        {missing.map((s) => (
          <MissingExamCard key={s.code} subjectCode={s.code} examType={examType} />
        ))}
      </div>
    </section>
  );
}

export default async function ExamsPage() {
  const exams = (await listExams()).filter((e) =>
    subjectExamTypes(e.subjectCode).includes(e.examType),
  );
  const order = (e: ExamListItem) =>
    MVP_SUBJECTS.findIndex((s) => s.code === e.subjectCode);
  const sorted = [...exams].sort((a, b) => order(a) - order(b));

  return (
    <PageShell>
      <div className="fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Пробники
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          ⏱ Тренировка как на экзамене
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Таймер, без подсказок по ходу, разбор после завершения.
        </p>
      </div>

      <ExamSection
        title="📗 ОГЭ"
        examType="oge"
        exams={sorted.filter((e) => e.examType === "oge")}
      />
      <ExamSection
        title="📘 ЕГЭ"
        examType="ege"
        exams={sorted.filter((e) => e.examType === "ege")}
      />
    </PageShell>
  );
}
