export const MVP_SUBJECT_CODES = [
  "russian",
  "math_basic",
  "social",
  "chemistry",
] as const;

export type MvpSubjectCode = (typeof MVP_SUBJECT_CODES)[number];

export type ExamKind = "oge" | "ege";

export const MVP_SUBJECTS: {
  code: MvpSubjectCode;
  title: string;
  short: string;
  emoji: string;
  examTypes: ExamKind[];
}[] = [
  {
    code: "russian",
    title: "Русский язык",
    short: "Орфография, пунктуация, текст",
    emoji: "📘",
    examTypes: ["oge", "ege"],
  },
  {
    code: "math_basic",
    title: "Математика (база)",
    short: "Числа, уравнения, задачи",
    emoji: "🔢",
    examTypes: ["oge", "ege"],
  },
  {
    code: "social",
    title: "Обществознание",
    short: "Человек, право, экономика",
    emoji: "🏛",
    examTypes: ["oge", "ege"],
  },
  {
    code: "chemistry",
    title: "Химия",
    short: "Атом, связи, расчёты",
    emoji: "🧪",
    examTypes: ["ege"],
  },
];

export function subjectExamTypes(code: string): ExamKind[] {
  return MVP_SUBJECTS.find((s) => s.code === code)?.examTypes ?? ["oge", "ege"];
}
