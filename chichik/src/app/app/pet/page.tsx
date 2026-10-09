import { PageShell } from "@/components/PageShell";
import { PetPanel } from "@/components/PetPanel";

export default function PetPage() {
  return (
    <PageShell>
      <div className="fade-up">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          🐬 Чичик
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
          Дельфин Чичик
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
          Простой питомец: гладьте, кормите и копите чирики за учёбу.
        </p>
      </div>

      <div className="mt-8">
        <PetPanel />
      </div>
    </PageShell>
  );
}
