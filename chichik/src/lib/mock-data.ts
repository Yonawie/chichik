export type ExamType = "oge" | "ege";
export type MasteryLevel = "weak" | "medium" | "good";

export type Subject = {
  code: string;
  title: string;
  short: string;
  emoji: string;
  examTypes: ExamType[];
  mastery: number;
  topicsDone: number;
  topicsTotal: number;
  image: string;
};

export type Topic = {
  id: string;
  subjectCode: string;
  examType: ExamType;
  title: string;
  emoji: string;
  theoryPreview: string;
  mastery: number;
  tasksCount: number;
};

export type Task = {
  id: string;
  topicId: string;
  stem: string;
  options?: string[];
  difficulty: 1 | 2 | 3;
};

export type Exam = {
  id: string;
  subjectCode: string;
  examType: ExamType;
  title: string;
  emoji: string;
  durationMin: number;
  tasksCount: number;
};

/** Предметы учебного MVP (биология/география вне scope). */
export const subjects: Subject[] = [
  {
    code: "russian",
    title: "Русский язык",
    short: "Орфография, пунктуация, текст",
    emoji: "📘",
    examTypes: ["oge", "ege"],
    mastery: 58,
    topicsDone: 4,
    topicsTotal: 10,
    image: "/images/subject-russian.jpg",
  },
  {
    code: "math_basic",
    title: "Математика (база)",
    short: "Числа, уравнения, задачи",
    emoji: "🔢",
    examTypes: ["oge", "ege"],
    mastery: 46,
    topicsDone: 3,
    topicsTotal: 10,
    image: "/images/subject-math.jpg",
  },
  {
    code: "social",
    title: "Обществознание",
    short: "Человек, право, экономика",
    emoji: "🏛",
    examTypes: ["oge", "ege"],
    mastery: 34,
    topicsDone: 2,
    topicsTotal: 10,
    image: "/images/subject-social.jpg",
  },
  {
    code: "chemistry",
    title: "Химия",
    short: "Атом, связи, расчёты",
    emoji: "🧪",
    examTypes: ["ege"],
    mastery: 67,
    topicsDone: 5,
    topicsTotal: 10,
    image: "/images/subject-chemistry.jpg",
  },
];

export const topics: Topic[] = [
  // Русский — 10
  {
    id: "ru-1",
    subjectCode: "russian",
    examType: "ege",
    title: "Орфограммы в корне",
    emoji: "✏️",
    theoryPreview: "Проверяемые, непроверяемые и чередующиеся гласные.",
    mastery: 78,
    tasksCount: 8,
  },
  {
    id: "ru-2",
    subjectCode: "russian",
    examType: "ege",
    title: "Н и НН",
    emoji: "📝",
    theoryPreview: "Прилагательные и причастия: одна Н или две.",
    mastery: 55,
    tasksCount: 7,
  },
  {
    id: "ru-3",
    subjectCode: "russian",
    examType: "ege",
    title: "Пунктуация в сложном предложении",
    emoji: "💬",
    theoryPreview: "Запятые в СПП и ССП, границы придаточных.",
    mastery: 40,
    tasksCount: 8,
  },
  {
    id: "ru-4",
    subjectCode: "russian",
    examType: "ege",
    title: "Лексика и выразительность",
    emoji: "✨",
    theoryPreview: "Синонимы, метафора, эпитет — типовые ловушки.",
    mastery: 30,
    tasksCount: 6,
  },
  {
    id: "ru-5",
    subjectCode: "russian",
    examType: "ege",
    title: "Работа с текстом",
    emoji: "📖",
    theoryPreview: "Главная мысль, микротемы, сжатие и аргументация.",
    mastery: 22,
    tasksCount: 6,
  },
  {
    id: "ru-6",
    subjectCode: "russian",
    examType: "ege",
    title: "Приставки пре-/при-",
    emoji: "🔤",
    theoryPreview: "Значения приставок и частые исключения.",
    mastery: 48,
    tasksCount: 7,
  },
  {
    id: "ru-7",
    subjectCode: "russian",
    examType: "ege",
    title: "Слитное и раздельное НЕ",
    emoji: "🚫",
    theoryPreview: "НЕ с разными частями речи: алгоритм выбора.",
    mastery: 36,
    tasksCount: 7,
  },
  {
    id: "ru-8",
    subjectCode: "russian",
    examType: "ege",
    title: "Обособленные члены предложения",
    emoji: "📌",
    theoryPreview: "Определения, обстоятельства, приложения.",
    mastery: 28,
    tasksCount: 6,
  },
  {
    id: "ru-9",
    subjectCode: "russian",
    examType: "oge",
    title: "Сжатое изложение",
    emoji: "🧾",
    theoryPreview: "Приёмы сжатия: исключение, обобщение, упрощение.",
    mastery: 42,
    tasksCount: 5,
  },
  {
    id: "ru-10",
    subjectCode: "russian",
    examType: "ege",
    title: "Сочинение: тезис и аргументы",
    emoji: "💡",
    theoryPreview: "Позиция, пример, логика, речевое оформление.",
    mastery: 25,
    tasksCount: 5,
  },

  // Математика — 10
  {
    id: "math-1",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Дроби и проценты",
    emoji: "½",
    theoryPreview: "Действия с дробями, «увеличить на» и «уменьшить на».",
    mastery: 65,
    tasksCount: 8,
  },
  {
    id: "math-2",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Линейные уравнения",
    emoji: "⚖️",
    theoryPreview: "Перенос слагаемых, скобки, проверка корня.",
    mastery: 50,
    tasksCount: 7,
  },
  {
    id: "math-3",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Геометрия: углы и площадь",
    emoji: "📐",
    theoryPreview: "Сумма углов треугольника, площадь фигур.",
    mastery: 42,
    tasksCount: 7,
  },
  {
    id: "math-4",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Функции и графики",
    emoji: "📈",
    theoryPreview: "Линейная функция y = kx + b, чтение графика.",
    mastery: 28,
    tasksCount: 6,
  },
  {
    id: "math-5",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Текстовые задачи",
    emoji: "🚌",
    theoryPreview: "Путь, работа, проценты — перевод в уравнение.",
    mastery: 18,
    tasksCount: 7,
  },
  {
    id: "math-6",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Степени и корни",
    emoji: "√",
    theoryPreview: "Свойства степеней, упрощение выражений.",
    mastery: 44,
    tasksCount: 6,
  },
  {
    id: "math-7",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Вероятность",
    emoji: "🎲",
    theoryPreview: "Классическая вероятность, благоприятные исходы.",
    mastery: 38,
    tasksCount: 6,
  },
  {
    id: "math-8",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Среднее и таблицы",
    emoji: "📊",
    theoryPreview: "Среднее арифметическое, чтение диаграмм.",
    mastery: 52,
    tasksCount: 5,
  },
  {
    id: "math-9",
    subjectCode: "math_basic",
    examType: "oge",
    title: "Неравенства",
    emoji: "≠",
    theoryPreview: "Линейные неравенства и числовая прямая.",
    mastery: 33,
    tasksCount: 6,
  },
  {
    id: "math-10",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Практические задачи",
    emoji: "🏠",
    theoryPreview: "Вклады, тарифы, планы квартир — базовый уровень.",
    mastery: 27,
    tasksCount: 6,
  },

  // Обществознание — 10
  {
    id: "soc-1",
    subjectCode: "social",
    examType: "ege",
    title: "Человек и общество",
    emoji: "👤",
    theoryPreview: "Потребности, деятельность, прогресс и регресс.",
    mastery: 45,
    tasksCount: 7,
  },
  {
    id: "soc-2",
    subjectCode: "social",
    examType: "ege",
    title: "Экономика: основы",
    emoji: "💰",
    theoryPreview: "Спрос, предложение, инфляция, налоги.",
    mastery: 33,
    tasksCount: 7,
  },
  {
    id: "soc-3",
    subjectCode: "social",
    examType: "ege",
    title: "Право: основы",
    emoji: "⚖️",
    theoryPreview: "Норма права, отрасли, правонарушение.",
    mastery: 25,
    tasksCount: 6,
  },
  {
    id: "soc-4",
    subjectCode: "social",
    examType: "ege",
    title: "Политика и государство",
    emoji: "🏛",
    theoryPreview: "Формы государства, гражданское общество, выборы.",
    mastery: 20,
    tasksCount: 6,
  },
  {
    id: "soc-5",
    subjectCode: "social",
    examType: "ege",
    title: "Социальная сфера",
    emoji: "👨‍👩‍👧",
    theoryPreview: "Семья, образование, социальная мобильность.",
    mastery: 15,
    tasksCount: 6,
  },
  {
    id: "soc-6",
    subjectCode: "social",
    examType: "ege",
    title: "Познание и наука",
    emoji: "🔬",
    theoryPreview: "Виды познания, истина, научное знание.",
    mastery: 30,
    tasksCount: 5,
  },
  {
    id: "soc-7",
    subjectCode: "social",
    examType: "ege",
    title: "Культура и духовная жизнь",
    emoji: "🎭",
    theoryPreview: "Формы культуры, мораль, искусство, религия.",
    mastery: 28,
    tasksCount: 5,
  },
  {
    id: "soc-8",
    subjectCode: "social",
    examType: "ege",
    title: "Рынок труда",
    emoji: "💼",
    theoryPreview: "Зарплата, безработица, роль государства.",
    mastery: 36,
    tasksCount: 5,
  },
  {
    id: "soc-9",
    subjectCode: "social",
    examType: "oge",
    title: "Конституция РФ",
    emoji: "📜",
    theoryPreview: "Основы строя, права и обязанности гражданина.",
    mastery: 41,
    tasksCount: 6,
  },
  {
    id: "soc-10",
    subjectCode: "social",
    examType: "ege",
    title: "Развёрнутый ответ",
    emoji: "🧠",
    theoryPreview: "План, аргументы, примеры для заданий высокого балла.",
    mastery: 18,
    tasksCount: 5,
  },

  // Химия — 10
  {
    id: "chem-1",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Строение атома",
    emoji: "⚛️",
    theoryPreview: "Протоны, нейтроны, электроны, изотопы.",
    mastery: 80,
    tasksCount: 7,
  },
  {
    id: "chem-2",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Химическая связь",
    emoji: "🔗",
    theoryPreview: "Ионная, ковалентная, металлическая связь.",
    mastery: 72,
    tasksCount: 7,
  },
  {
    id: "chem-3",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Классы соединений",
    emoji: "🧂",
    theoryPreview: "Оксиды, кислоты, основания, соли.",
    mastery: 68,
    tasksCount: 8,
  },
  {
    id: "chem-4",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Расчёты по формулам",
    emoji: "🧮",
    theoryPreview: "Количество вещества, молярная масса, масса.",
    mastery: 55,
    tasksCount: 7,
  },
  {
    id: "chem-5",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Реакции и коэффициенты",
    emoji: "🔥",
    theoryPreview: "Типы реакций, расстановка коэффициентов.",
    mastery: 48,
    tasksCount: 7,
  },
  {
    id: "chem-6",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Периодический закон",
    emoji: "🗂",
    theoryPreview: "Периоды, группы, изменение свойств элементов.",
    mastery: 62,
    tasksCount: 6,
  },
  {
    id: "chem-7",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Растворы и концентрации",
    emoji: "💧",
    theoryPreview: "Массовая доля, молярность, разбавление.",
    mastery: 40,
    tasksCount: 6,
  },
  {
    id: "chem-8",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Окислительно-восстановительные реакции",
    emoji: "⚡",
    theoryPreview: "Степени окисления, электронный баланс.",
    mastery: 35,
    tasksCount: 6,
  },
  {
    id: "chem-9",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Признаки реакций",
    emoji: "👀",
    theoryPreview: "Осадок, газ, изменение цвета, тепловой эффект.",
    mastery: 70,
    tasksCount: 5,
  },
  {
    id: "chem-10",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Органика: углеводороды",
    emoji: "🛢",
    theoryPreview: "Алканы, алкены, алкины — базовые понятия.",
    mastery: 32,
    tasksCount: 6,
  },

  // Биология — ОГЭ
  {
    id: "bio-oge-1",
    subjectCode: "biology",
    examType: "oge",
    title: "Клетка: строение",
    emoji: "🔬",
    theoryPreview: "Органоиды клетки, отличия растительной и животной клетки.",
    mastery: 48,
    tasksCount: 7,
  },
  {
    id: "bio-oge-2",
    subjectCode: "biology",
    examType: "oge",
    title: "Бактерии, грибы, растения",
    emoji: "🍄",
    theoryPreview: "Признаки царств, примеры, значение в природе.",
    mastery: 40,
    tasksCount: 6,
  },
  {
    id: "bio-oge-3",
    subjectCode: "biology",
    examType: "oge",
    title: "Человек: системы органов",
    emoji: "🫀",
    theoryPreview: "Опорно-двигательная, пищеварительная, дыхательная системы.",
    mastery: 35,
    tasksCount: 7,
  },
  {
    id: "bio-oge-4",
    subjectCode: "biology",
    examType: "oge",
    title: "Здоровье и гигиена",
    emoji: "🩺",
    theoryPreview: "Профилактика заболеваний, режим, первая помощь.",
    mastery: 52,
    tasksCount: 5,
  },
  {
    id: "bio-oge-5",
    subjectCode: "biology",
    examType: "oge",
    title: "Экология (ОГЭ)",
    emoji: "🌿",
    theoryPreview: "Экосистемы, цепи питания, влияние человека.",
    mastery: 30,
    tasksCount: 6,
  },
  // Биология — ЕГЭ
  {
    id: "bio-ege-1",
    subjectCode: "biology",
    examType: "ege",
    title: "Молекулярная биология",
    emoji: "🧬",
    theoryPreview: "ДНК, РНК, белки, репликация и синтез белка.",
    mastery: 28,
    tasksCount: 7,
  },
  {
    id: "bio-ege-2",
    subjectCode: "biology",
    examType: "ege",
    title: "Генетика",
    emoji: "🧪",
    theoryPreview: "Законы Менделя, сцепленное наследование, задачи.",
    mastery: 22,
    tasksCount: 8,
  },
  {
    id: "bio-ege-3",
    subjectCode: "biology",
    examType: "ege",
    title: "Эволюция",
    emoji: "🦕",
    theoryPreview: "Дарвинизм, движущие силы, видообразование.",
    mastery: 33,
    tasksCount: 6,
  },
  {
    id: "bio-ege-4",
    subjectCode: "biology",
    examType: "ege",
    title: "Анатомия и физиология",
    emoji: "🧠",
    theoryPreview: "Нервная и гуморальная регуляция, кровь, иммунитет.",
    mastery: 37,
    tasksCount: 7,
  },
  {
    id: "bio-ege-5",
    subjectCode: "biology",
    examType: "ege",
    title: "Экология (ЕГЭ)",
    emoji: "🌎",
    theoryPreview: "Популяции, биосфера, круговороты веществ.",
    mastery: 26,
    tasksCount: 6,
  },

  // География — ОГЭ
  {
    id: "geo-oge-1",
    subjectCode: "geography",
    examType: "oge",
    title: "План и карта",
    emoji: "🗺",
    theoryPreview: "Масштаб, условные знаки, азимут, координаты.",
    mastery: 50,
    tasksCount: 7,
  },
  {
    id: "geo-oge-2",
    subjectCode: "geography",
    examType: "oge",
    title: "Литосфера и рельеф",
    emoji: "⛰",
    theoryPreview: "Строение Земли, формы рельефа, землетрясения.",
    mastery: 42,
    tasksCount: 6,
  },
  {
    id: "geo-oge-3",
    subjectCode: "geography",
    examType: "oge",
    title: "Атмосфера и климат",
    emoji: "🌤",
    theoryPreview: "Погода и климат, пояса, атмосферное давление.",
    mastery: 36,
    tasksCount: 6,
  },
  {
    id: "geo-oge-4",
    subjectCode: "geography",
    examType: "oge",
    title: "Гидросфера",
    emoji: "🌊",
    theoryPreview: "Мировой океан, реки, озёра, круговорот воды.",
    mastery: 39,
    tasksCount: 5,
  },
  {
    id: "geo-oge-5",
    subjectCode: "geography",
    examType: "oge",
    title: "Население России (ОГЭ)",
    emoji: "👥",
    theoryPreview: "Численность, размещение, крупные города.",
    mastery: 31,
    tasksCount: 6,
  },
  // География — ЕГЭ
  {
    id: "geo-ege-1",
    subjectCode: "geography",
    examType: "ege",
    title: "Природа Земли",
    emoji: "🌏",
    theoryPreview: "Геосферы, природные зоны, закономерности размещения.",
    mastery: 34,
    tasksCount: 7,
  },
  {
    id: "geo-ege-2",
    subjectCode: "geography",
    examType: "ege",
    title: "Население мира",
    emoji: "🌐",
    theoryPreview: "Демография, миграции, урбанизация, этносы.",
    mastery: 29,
    tasksCount: 6,
  },
  {
    id: "geo-ege-3",
    subjectCode: "geography",
    examType: "ege",
    title: "Мировое хозяйство",
    emoji: "🏭",
    theoryPreview: "Отрасли, международная торговля, факторы размещения.",
    mastery: 24,
    tasksCount: 6,
  },
  {
    id: "geo-ege-4",
    subjectCode: "geography",
    examType: "ege",
    title: "География России",
    emoji: "🇷🇺",
    theoryPreview: "Регионы, ресурсы, хозяйство и население РФ.",
    mastery: 27,
    tasksCount: 7,
  },
  {
    id: "geo-ege-5",
    subjectCode: "geography",
    examType: "ege",
    title: "Работа с картой и статистикой",
    emoji: "📈",
    theoryPreview: "Чтение карт, таблицы, типовые расчётные задания ЕГЭ.",
    mastery: 21,
    tasksCount: 6,
  },
];

export const sampleTasks: Task[] = [
  {
    id: "t1",
    topicId: "ru-1",
    stem: "В каком слове пишется буква О в корне?",
    options: ["к..сательная", "прик..саться", "к..снуться", "предл..жение"],
    difficulty: 1,
  },
  {
    id: "t2",
    topicId: "ru-1",
    stem: "Выберите слово с чередующейся гласной в корне.",
    options: ["вода", "гора", "касаться", "тетрадь"],
    difficulty: 2,
  },
  {
    id: "t3",
    topicId: "ru-1",
    stem: "Вставьте пропущенную букву: прик..сновение",
    difficulty: 2,
  },
];

export const exams: Exam[] = [
  {
    id: "exam-ru",
    subjectCode: "russian",
    examType: "ege",
    title: "Пробник ЕГЭ: русский язык",
    emoji: "📘",
    durationMin: 210,
    tasksCount: 27,
  },
  {
    id: "exam-ru-oge",
    subjectCode: "russian",
    examType: "oge",
    title: "Пробник ОГЭ: русский язык",
    emoji: "📗",
    durationMin: 235,
    tasksCount: 9,
  },
  {
    id: "exam-math",
    subjectCode: "math_basic",
    examType: "ege",
    title: "Пробник ЕГЭ: математика (база)",
    emoji: "🔢",
    durationMin: 180,
    tasksCount: 21,
  },
  {
    id: "exam-math-oge",
    subjectCode: "math_basic",
    examType: "oge",
    title: "Пробник ОГЭ: математика",
    emoji: "📐",
    durationMin: 235,
    tasksCount: 25,
  },
  {
    id: "exam-soc-oge",
    subjectCode: "social",
    examType: "oge",
    title: "Пробник ОГЭ: обществознание",
    emoji: "🏛",
    durationMin: 180,
    tasksCount: 24,
  },
  {
    id: "exam-soc",
    subjectCode: "social",
    examType: "ege",
    title: "Пробник ЕГЭ: обществознание",
    emoji: "🏛",
    durationMin: 50,
    tasksCount: 14,
  },
  {
    id: "exam-chem",
    subjectCode: "chemistry",
    examType: "ege",
    title: "Пробник ЕГЭ: химия",
    emoji: "🧪",
    durationMin: 210,
    tasksCount: 34,
  },
  {
    id: "exam-bio-oge",
    subjectCode: "biology",
    examType: "oge",
    title: "Пробник ОГЭ: биология",
    emoji: "🧬",
    durationMin: 40,
    tasksCount: 12,
  },
  {
    id: "exam-bio-ege",
    subjectCode: "biology",
    examType: "ege",
    title: "Пробник ЕГЭ: биология",
    emoji: "🔬",
    durationMin: 235,
    tasksCount: 28,
  },
  {
    id: "exam-geo-oge",
    subjectCode: "geography",
    examType: "oge",
    title: "Пробник ОГЭ: география",
    emoji: "🌍",
    durationMin: 150,
    tasksCount: 30,
  },
  {
    id: "exam-geo-ege",
    subjectCode: "geography",
    examType: "ege",
    title: "Пробник ЕГЭ: география",
    emoji: "🗺",
    durationMin: 50,
    tasksCount: 14,
  },
];

export function examTypeLabel(examType: ExamType): string {
  return examType === "oge" ? "ОГЭ" : "ЕГЭ";
}

export function masteryLevel(mastery: number): MasteryLevel {
  if (mastery < 40) return "weak";
  if (mastery < 70) return "medium";
  return "good";
}

export function masteryLabel(level: MasteryLevel): string {
  if (level === "weak") return "😕 Слабо";
  if (level === "medium") return "🙂 Средне";
  return "😄 Хорошо";
}

export function getSubject(code: string) {
  return subjects.find((s) => s.code === code);
}

export function getTopicsBySubject(code: string) {
  return topics.filter((t) => t.subjectCode === code);
}

export function getTopicsBySubjectGrouped(code: string) {
  const list = getTopicsBySubject(code);
  return {
    oge: list.filter((t) => t.examType === "oge"),
    ege: list.filter((t) => t.examType === "ege"),
  };
}

export function getTopic(id: string) {
  return topics.find((t) => t.id === id);
}

export function getExam(id: string) {
  return exams.find((e) => e.id === id);
}
