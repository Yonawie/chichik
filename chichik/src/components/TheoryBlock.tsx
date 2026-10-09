/** Простой рендер markdown-теории без тяжёлых библиотек. */
export function TheoryBlock({ markdown }: { markdown: string }) {
  const blocks = markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return <p className="text-[var(--muted)]">Теория пока не добавлена.</p>;
  }

  return (
    <div className="space-y-3 text-[var(--ink-soft)] leading-relaxed">
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return (
            <h4 key={i} className="font-display text-lg font-semibold text-[var(--accent-ink)]">
              {block.slice(4)}
            </h4>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h3 key={i} className="font-display text-xl font-semibold text-[var(--accent-ink)]">
              {block.slice(3)}
            </h3>
          );
        }
        if (block.startsWith("# ")) {
          return (
            <h3 key={i} className="font-display text-xl font-semibold text-[var(--accent-ink)]">
              {block.slice(2)}
            </h3>
          );
        }
        if (block.startsWith("- ") || block.startsWith("* ")) {
          const items = block.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim());
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}
