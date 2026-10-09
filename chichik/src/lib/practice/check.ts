export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase().replace(",", ".");
}

export function checkAnswer(
  taskType: "single" | "multi" | "short" | "numeric",
  userAnswer: string,
  answerKey: string,
): boolean {
  const user = normalizeAnswer(userAnswer);
  const key = normalizeAnswer(answerKey);

  if (!user || !key) return false;

  if (taskType === "multi") {
    const userParts = user
      .split(/[,;|]/)
      .map((p) => p.trim())
      .filter(Boolean)
      .sort();
    const keyParts = key
      .split(/[,;|]/)
      .map((p) => p.trim())
      .filter(Boolean)
      .sort();
    return userParts.length === keyParts.length && userParts.every((p, i) => p === keyParts[i]);
  }

  if (taskType === "numeric") {
    const u = Number(user);
    const k = Number(key);
    if (!Number.isFinite(u) || !Number.isFinite(k)) return user === key;
    return Math.abs(u - k) < 1e-6;
  }

  return user === key;
}
