export type TaskType = "single" | "multi" | "short" | "numeric";

export type AnswerInput = { taskId: string; answer: string };

export type RunnerTask = {
  id: string;
  taskType: TaskType;
  stem: string;
  options?: string[];
  topicTitle: string;
};

export type GradedItem = {
  taskId: string;
  topicId: string;
  topicTitle: string;
  stem: string;
  userAnswer: string;
  correct: boolean;
  answerKey: string;
  solution: string;
};

export type SubmitResult =
  | { ok: true; correctCount: number; redirectTo?: string; review?: GradedItem[] }
  | { ok: false; message: string };
