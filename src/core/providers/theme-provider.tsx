import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "../config/themes";
import { resolveTheme, type ThemePreference } from "../utils/theme";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  /** The visitor's selected tri-state preference (dark | light | system). */
  preference: ThemePreference;
  /** Sets the tri-state preference, persisting and applying it within the same tick. */
  setPreference: (preference: ThemePreference) => void;
  /** The effective resolved theme. Kept for backward compatibility. */
  mode: "light" | "dark";
  /**
   * Backward-compatible setter. Accepts an explicit "light" | "dark" value and
   * stores it as the preference. Existing consumers continue to work unchanged.
   */
  setMode: (mode: "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = "app-mode";

const prefersDark = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const readStoredPreference = (): ThemePreference => {
  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }
  return "system";
};

const applyDarkClass = (effective: "light" | "dark") => {
  if (effective === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<string>(() => {
    return localStorage.getItem("app-theme") || "zinc";
  });

  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readStoredPreference()
  );

  // The effective resolved theme ("light" | "dark"). Initialised from the
  // stored preference and the current prefers-color-scheme result.
  const [mode, setModeState] = useState<"light" | "dark">(() =>
    resolveTheme(readStoredPreference(), prefersDark())
  );

  const setTheme = (name: string) => {
    setThemeState(name);
    localStorage.setItem("app-theme", name);
  };

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    localStorage.setItem(MODE_STORAGE_KEY, next);
    // Resolve and apply the effective theme within the same tick.
    const effective = resolveTheme(next, prefersDark());
    setModeState(effective);
    applyDarkClass(effective);
  };

  // Backward-compatible: setting an explicit mode is equivalent to selecting
  // that explicit preference.
  const setMode = (m: "light" | "dark") => {
    setPreference(m);
  };

  // Live-update the applied theme when the OS preference changes while the
  // visitor's preference is "system".
  useEffect(() => {
    if (preference !== "system") {
      return;
    }
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      const effective = resolveTheme("system", event.matches);
      setModeState(effective);
      applyDarkClass(effective);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [preference]);

  // Apply the dark class and palette CSS variables whenever the resolved theme
  // or palette name changes.
  useEffect(() => {
    applyDarkClass(mode);

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
      value={{ theme: themeName, setTheme, preference, setPreference, mode, setMode }}
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
