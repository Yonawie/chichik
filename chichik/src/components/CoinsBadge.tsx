"use client";

import Link from "next/link";
import { usePet } from "@/components/PetProvider";

export function CoinsBadge({ variant = "sidebar" }: { variant?: "sidebar" | "light" }) {
  const { state, ready } = usePet();
  const className =
    variant === "sidebar"
      ? "rounded-[10px] bg-white/10 px-3 py-1.5 text-sm font-semibold text-[var(--sidebar-ink)] transition-colors hover:bg-white/15"
      : "rounded-[10px] bg-[var(--surface-2)] px-3 py-1.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)]";

  return (
    <Link href="/app/shop" className={className} title="Чирики и магазин">
      💠 {ready ? state.chiriki : "…"}
    </Link>
  );
}
