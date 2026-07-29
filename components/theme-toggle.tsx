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
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      className="icon-button"
      onClick={toggleTheme}
      type="button"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
