import { useEffect, useState } from "react";

const KEY = "gov_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem(KEY) as "light" | "dark") || "dark";
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") };
}
