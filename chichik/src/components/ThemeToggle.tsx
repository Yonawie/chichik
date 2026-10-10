"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("chichik-theme", theme);
  } catch {}
  window.dispatchEvent(new Event("themechange"));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem("chichik-theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className={`btn btn-ghost px-3 text-sm ${className}`}
      onClick={() => {
        applyTheme(next);
      }}
      aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
    >
      {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
    </button>
  );
}
