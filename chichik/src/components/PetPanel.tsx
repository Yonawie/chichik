"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePet } from "@/components/PetProvider";
import {
  getFood,
  hungerLabel,
  inventoryCount,
  moodLabel,
  shopFoods,
  type FoodId,
} from "@/lib/pet-store";

export function PetPanel() {
  const { state, ready, feed, pet } = usePet();
  const [message, setMessage] = useState("");
  const [happy, setHappy] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodId>("plankton");

  const ownedFoods = useMemo(
    () => shopFoods.filter((f) => (state.inventory[f.id] ?? 0) > 0),
    [state.inventory],
  );

  const activeFoodId =
    ownedFoods.some((f) => f.id === selectedFood)
      ? selectedFood
      : (ownedFoods[0]?.id ?? selectedFood);

  const happyTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (happyTimer.current) window.clearTimeout(happyTimer.current);
  }, []);

  const triggerHappy = (ms = 900) => {
    if (happyTimer.current) return;
    setHappy(true);
    happyTimer.current = window.setTimeout(() => {
      setHappy(false);
      happyTimer.current = null;
    }, ms);
  };

  const onFeed = () => {
    if (!activeFoodId || ownedFoods.length === 0) {
      setMessage("Сначала купите еду в магазине.");
      return;
    }
    const result = feed(activeFoodId);
    setMessage(result.message);
    if (result.ok) triggerHappy(900);
  };

  const onPet = () => {
    const result = pet();
    setMessage(result.message);
    triggerHappy(1100);
  };

  const selected = getFood(activeFoodId);

  return (
    <section className="surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[minmax(280px,1.15fr)_minmax(280px,0.85fr)]">
        <div className="border-b border-[var(--line)] lg:border-b-0 lg:border-r">
          <div className="pet-stage">
            <button
              type="button"
              className="pet-dolphin"
              onClick={onPet}
              aria-label="Погладить Чичика"
            >
              <span className={`pet-dolphin-body ${happy ? "is-happy" : ""}`}>
                <Image
                  src="/images/pet-dolphin-full.jpg"
                  alt="Дельфин Чичик"
                  width={720}
                  height={960}
                  sizes="(max-width: 1024px) 92vw, 420px"
                  className="h-auto w-full object-contain"
                  priority
                />
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Виртуальный питомец
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[var(--accent-ink)]">
                Чичик
              </h2>
              <p className="mt-2 max-w-lg text-[var(--ink-soft)]">
                Кормите и гладьте дельфина. Чирики зарабатываются за верные ответы.
              </p>
            </div>
            <div className="rounded-[10px] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold">
              💠 {ready ? state.chiriki : "…"} чириков
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>Сытость: {ready ? hungerLabel(state.hunger) : "…"}</span>
                <span>{ready ? `${state.hunger}%` : ""}</span>
              </div>
              <div className="progress">
                <span style={{ width: `${ready ? state.hunger : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>Настроение: {ready ? moodLabel(state.mood) : "…"}</span>
                <span>{ready ? `${state.mood}%` : ""}</span>
              </div>
              <div className="progress">
                <span style={{ width: `${ready ? state.mood : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {ownedFoods.length > 0 ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Еда из запасов</span>
                  <select
                    className="field"
                    value={activeFoodId}
                    onChange={(e) => setSelectedFood(e.target.value as FoodId)}
                  >
                    {ownedFoods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.emoji} {food.title} ×{state.inventory[food.id]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={onFeed}
                  disabled={!ready || state.hunger >= 100}
                >
                  Покормить{selected ? `: ${selected.emoji} ${selected.title}` : ""}
                </button>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Запасов нет ({ready ? inventoryCount(state) : 0}). Купите еду в магазине.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn btn-secondary" onClick={onPet} disabled={!ready}>
                Погладить
              </button>
              <Link href="/app/shop" className="btn btn-secondary">
                🛒 Магазин
              </Link>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Покормлено: {ready ? state.fedTimes : 0}
          </p>
          {message ? (
            <p className="mt-2 text-sm text-[var(--accent-ink)]">{message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
