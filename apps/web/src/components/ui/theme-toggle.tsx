"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // evita bug de hidratação: só renderiza depois de montar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm
        transition
        border-foreground/20
        bg-background/80
        hover:bg-foreground hover:text-background
      "
    >
      <span aria-hidden="true">
        {isDark ? "🌙" : "☀️"}
      </span>
      <span>{isDark ? "Modo escuro" : "Modo claro"}</span>
    </button>
  );
}
