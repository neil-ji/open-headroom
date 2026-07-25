import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "dark" | "light";
type Language = "en" | "zh";

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("headroom-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialLang(): Language {
  const saved = localStorage.getItem("headroom-lang");
  return saved === "zh" ? "zh" : "en";
}

/**
 * Apply theme to both Tailwind (html.dark class) and spark-ui (data-theme attr).
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
  localStorage.setItem("headroom-theme", theme);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [lang, setLangState] = useState<Language>(getInitialLang);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("headroom-lang", l);
    document.documentElement.lang = l;
  }, []);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
