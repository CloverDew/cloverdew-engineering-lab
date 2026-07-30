"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("cloverdew-theme", next ? "dark" : "light");
  }

  return (
    <button
      aria-label={dark ? "切换到浅色主题" : "切换到深色主题"}
      className="icon-button"
      onClick={toggleTheme}
      type="button"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
