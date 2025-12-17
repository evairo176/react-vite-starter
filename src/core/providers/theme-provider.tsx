import { createContext, useContext, useEffect, useState } from "react";
import { type Theme, type ThemeColors } from "../types/theme.type";
import { themes } from "../config/themes";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<string>(() => {
    return localStorage.getItem("app-theme") || "zinc";
  });

  const [mode, setModeState] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("app-mode") as "light" | "dark") || "light";
  });

  const setTheme = (name: string) => {
    setThemeState(name);
    localStorage.setItem("app-theme", name);
  };

  const setMode = (m: "light" | "dark") => {
    setModeState(m);
    localStorage.setItem("app-mode", m);
    if (m === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    // Initial mode Application
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const currentTheme = themes.find((t) => t.name === themeName) || themes[0];
    const colors =
      mode === "dark" ? currentTheme.cssVars.dark : currentTheme.cssVars.light;

    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [themeName, mode]);

  return (
    <ThemeContext.Provider
      value={{ theme: themeName, setTheme, mode, setMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
