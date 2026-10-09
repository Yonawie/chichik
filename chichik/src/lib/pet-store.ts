export const PET_STORAGE_KEY = "chichik-pet-state-v3";
export const CHIRIKI_PER_CORRECT = 5;
export const PET_MOOD_GAIN = 12;
export const FEED_HUNGER_GAIN = 22;

export type FoodId = "fish" | "squid" | "plankton" | "kelp" | "premium";

export type FoodItem = {
  id: FoodId;
  title: string;
  emoji: string;
  price: number;
  hunger: number;
  description: string;
};

export const shopFoods: FoodItem[] = [
  {
    id: "plankton",
    title: "Планктон",
    emoji: "🫧",
    price: 5,
    hunger: 12,
    description: "Лёгкий перекус для Чичика.",
  },
  {
    id: "kelp",
    title: "Водоросли",
    emoji: "🌿",
    price: 8,
    hunger: 18,
    description: "Полезно и сытно.",
  },
  {
    id: "fish",
    title: "Рыбка",
    emoji: "🐟",
    price: 12,
    hunger: 28,
    description: "Классический обед дельфина.",
  },
  {
    id: "squid",
    title: "Кальмар",
    emoji: "🦑",
    price: 18,
    hunger: 40,
    description: "Плотный ужин.",
  },
  {
    id: "premium",
    title: "Премиум-набор",
    emoji: "🎁",
    price: 30,
    hunger: 55,
    description: "Большая порция и отличное настроение.",
  },
];

export type PetState = {
  chiriki: number;
  hunger: number;
  mood: number;
  fedTimes: number;
  petTimes: number;
  inventory: Record<FoodId, number>;
};

export const defaultPetState: PetState = {
  chiriki: 20,
  hunger: 45,
  mood: 12,
  fedTimes: 0,
  petTimes: 0,
  inventory: {
    plankton: 1,
    kelp: 0,
    fish: 0,
    squid: 0,
    premium: 0,
  },
};

function emptyInventory(): Record<FoodId, number> {
  return { plankton: 0, kelp: 0, fish: 0, squid: 0, premium: 0 };
}

export function getFood(id: FoodId) {
  return shopFoods.find((f) => f.id === id);
}

export function inventoryCount(state: PetState) {
  return Object.values(state.inventory).reduce((sum, n) => sum + n, 0);
}

function storageKey(userId?: string | null) {
  return `${PET_STORAGE_KEY}:${userId ?? "guest"}`;
}

export function loadPetState(userId?: string | null): PetState {
  if (typeof window === "undefined") return defaultPetState;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return defaultPetState;
    const parsed = JSON.parse(raw) as Partial<PetState>;
    const inv = { ...emptyInventory(), ...(parsed.inventory ?? {}) };
    const chiriki = parsed.chiriki ?? defaultPetState.chiriki;
    return {
      chiriki: Math.max(0, Number(chiriki) || 0),
      hunger: Math.min(100, Math.max(0, Number(parsed.hunger) || 0)),
      mood: Math.min(100, Math.max(0, Number(parsed.mood) ?? defaultPetState.mood)),
      fedTimes: Math.max(0, Number(parsed.fedTimes) || 0),
      petTimes: Math.max(0, Number(parsed.petTimes) || 0),
      inventory: inv,
    };
  } catch {
    return defaultPetState;
  }
}

export function savePetState(state: PetState, userId?: string | null) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export function hungerLabel(hunger: number): string {
  if (hunger >= 80) return "Сыт и доволен";
  if (hunger >= 50) return "Нормально";
  if (hunger >= 25) return "Проголодался";
  return "Очень голоден";
}

export type PetEmotion = "sad" | "neutral" | "happy";

/** Настроение и эмоция зависят от числа поглаживаний. */
export function moodFromPetTimes(petTimes: number): number {
  return Math.min(100, Math.max(8, 12 + petTimes * 9));
}

export function getEmotion(petTimes: number): PetEmotion {
  if (petTimes <= 2) return "sad";
  if (petTimes <= 7) return "neutral";
  return "happy";
}

export function emotionLabel(emotion: PetEmotion): string {
  if (emotion === "sad") return "Грусть";
  if (emotion === "happy") return "Радость";
  return "Спокойствие";
}

export function emotionEmoji(emotion: PetEmotion): string {
  if (emotion === "sad") return "😢";
  if (emotion === "happy") return "😄";
  return "😐";
}

export function moodLabel(mood: number): string {
  if (mood >= 80) return "В восторге";
  if (mood >= 50) return "Рад общению";
  if (mood >= 25) return "Хочет внимания";
  return "Скучает";
}

export function emotionHint(petTimes: number): string {
  const emotion = getEmotion(petTimes);
  if (emotion === "sad") {
    return "Чичику грустно — погладьте его ещё несколько раз.";
  }
  if (emotion === "happy") {
    return "Чичик сияет от радости: ему нравится ваше внимание!";
  }
  return "Чичик спокоен. Ещё немного поглаживаний — и станет веселее.";
}
