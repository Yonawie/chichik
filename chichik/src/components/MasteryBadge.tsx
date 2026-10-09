import { masteryLabel, masteryLevel, type MasteryLevel } from "@/lib/mock-data";

const classByLevel: Record<MasteryLevel, string> = {
  weak: "badge-weak",
  medium: "badge-medium",
  good: "badge-good",
};

export function MasteryBadge({ mastery }: { mastery: number }) {
  const level = masteryLevel(mastery);
  return (
    <span className={`badge ${classByLevel[level]}`}>
      {masteryLabel(level)} · {mastery}%
    </span>
  );
}
