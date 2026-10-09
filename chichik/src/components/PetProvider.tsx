"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CHIRIKI_PER_CORRECT,
  FEED_HUNGER_GAIN,
  defaultPetState,
  getFood,
  loadPetState,
  moodFromPetTimes,
  savePetState,
  type FoodId,
  type PetState,
} from "@/lib/pet-store";

type ActionResult = { ok: boolean; message: string };

type PetContextValue = {
  state: PetState;
  ready: boolean;
  feed: (foodId: FoodId) => ActionResult;
  pet: () => ActionResult;
  buyFood: (foodId: FoodId) => ActionResult;
  rewardCorrect: (times?: number) => { ok: boolean; gained: number };
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({
  children,
  userId = null,
}: {
  children: ReactNode;
  userId?: string | null;
}) {
  const [state, setState] = useState<PetState>(defaultPetState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadPetState(userId);
    setState({
      ...loaded,
      mood: moodFromPetTimes(loaded.petTimes),
    });
    setReady(true);
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    savePetState(state, userId);
  }, [state, ready, userId]);

  const buyFood = useCallback(
    (foodId: FoodId): ActionResult => {
      const food = getFood(foodId);
      if (!food) return { ok: false, message: "Товар не найден." };
      if (state.chiriki < food.price) {
        return {
          ok: false,
          message: `Нужно ${food.price} чириков. Сейчас: ${state.chiriki}.`,
        };
      }
      setState((prev) => ({
        ...prev,
        chiriki: prev.chiriki - food.price,
        inventory: {
          ...prev.inventory,
          [foodId]: (prev.inventory[foodId] ?? 0) + 1,
        },
      }));
      return { ok: true, message: `Куплено: ${food.emoji} ${food.title}` };
    },
    [state.chiriki],
  );

  const feed = useCallback(
    (foodId: FoodId): ActionResult => {
      const food = getFood(foodId);
      if (!food) return { ok: false, message: "Еда не найдена." };
      if ((state.inventory[foodId] ?? 0) < 1) {
        return { ok: false, message: "Сначала купите еду в магазине." };
      }
      if (state.hunger >= 100) {
        return { ok: false, message: "Чичик уже сыт. Загляните позже." };
      }
      setState((prev) => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + (food.hunger || FEED_HUNGER_GAIN)),
        fedTimes: prev.fedTimes + 1,
        inventory: {
          ...prev.inventory,
          [foodId]: Math.max(0, (prev.inventory[foodId] ?? 0) - 1),
        },
      }));
      return { ok: true, message: `Чичик съел: ${food.emoji} ${food.title}` };
    },
    [state.hunger, state.inventory],
  );

  const pet = useCallback((): ActionResult => {
    const nextTimes = state.petTimes + 1;
    setState((prev) => ({
      ...prev,
      petTimes: prev.petTimes + 1,
      mood: moodFromPetTimes(prev.petTimes + 1),
    }));
    if (nextTimes <= 2) {
      return { ok: true, message: "Чичику всё ещё грустновато… погладьте ещё." };
    }
    if (nextTimes <= 7) {
      return { ok: true, message: "Чичик оживает и чувствует себя лучше!" };
    }
    return { ok: true, message: "Чичик сияет от радости!" };
  }, [state.petTimes]);

  const rewardCorrect = useCallback((times = 1) => {
    const gained = CHIRIKI_PER_CORRECT * Math.max(0, times);
    setState((prev) => ({
      ...prev,
      chiriki: prev.chiriki + gained,
    }));
    return { ok: true, gained };
  }, []);

  const value = useMemo(
    () => ({ state, ready, feed, pet, buyFood, rewardCorrect }),
    [state, ready, feed, pet, buyFood, rewardCorrect],
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) {
    throw new Error("usePet must be used within PetProvider");
  }
  return ctx;
}
