"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("chichik-theme", theme);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("chichik-theme") as Theme | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className={`btn btn-ghost px-3 text-sm ${className}`}
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
      aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
    >
      {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
    </button>
  );
}
