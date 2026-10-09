"use client";

import Link from "next/link";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { usePet } from "@/components/PetProvider";
import { shopFoods } from "@/lib/pet-store";

export default function ShopPage() {
  const { state, ready, buyFood } = usePet();
  const [message, setMessage] = useState("");

  return (
    <PageShell>
      <div className="fade-up flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            🛒 Магазин
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--accent-ink)]">
            Еда для Чичика
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
            Покупайте еду за чирики. За каждый правильный ответ: +5 чириков.
          </p>
        </div>
        <div className="rounded-[10px] bg-[var(--surface)] px-4 py-3 text-sm font-semibold shadow-[var(--shadow)]">
          Баланс: 💠 {ready ? state.chiriki : "…"} чириков
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {shopFoods.map((food) => {
          const owned = ready ? state.inventory[food.id] ?? 0 : 0;
          const canBuy = ready && state.chiriki >= food.price;
          return (
            <article key={food.id} className="surface p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    {food.emoji} {food.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{food.description}</p>
                </div>
                <span className="badge bg-[var(--accent-soft)] text-[var(--accent-ink)]">
                  +{food.hunger} сытости
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">💠 {food.price} чириков</p>
                <p className="text-sm text-[var(--muted)]">В запасе: {owned}</p>
              </div>
              <button
                type="button"
                className="btn btn-primary mt-4"
                disabled={!canBuy}
                onClick={() => {
                  const result = buyFood(food.id);
                  setMessage(result.message);
                }}
              >
                Купить
              </button>
            </article>
          );
        })}
      </div>

      {message ? (
        <p className="mt-6 text-sm font-medium text-[var(--accent-ink)]">{message}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/app/pet" className="btn btn-secondary">
          🐬 К Чичику
        </Link>
        <Link href="/app" className="btn btn-secondary">
          На главную
        </Link>
      </div>
    </PageShell>
  );
}
