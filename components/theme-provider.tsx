"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: "#4f46e5",
  secondaryColor: "#565e74",
  refreshTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState("#565e74");

  const applyTheme = (primary: string, secondary: string) => {
    const root = document.documentElement;
    root.style.setProperty("--dynamic-primary", primary);
    root.style.setProperty("--dynamic-secondary", secondary);
    root.style.setProperty("--dynamic-primary-container", primary + "20");
    root.style.setProperty("--dynamic-primary-hover", primary + "e6");
  };

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      const org = data.organization;
      if (org) {
        const p = org.primaryColor || "#4f46e5";
        const s = org.secondaryColor || "#565e74";
        setPrimaryColor(p);
        setSecondaryColor(s);
        applyTheme(p, s);
        localStorage.setItem("theme-cache", JSON.stringify({ primaryColor: p, secondaryColor: s }));
      }
    } catch {
      const cached = localStorage.getItem("theme-cache");
      if (cached) {
        const { primaryColor: p, secondaryColor: s } = JSON.parse(cached);
        setPrimaryColor(p);
        setSecondaryColor(s);
        applyTheme(p, s);
      }
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("theme-cache");
    if (cached) {
      const { primaryColor: p, secondaryColor: s } = JSON.parse(cached);
      setPrimaryColor(p);
      setSecondaryColor(s);
      applyTheme(p, s);
    }
    fetchTheme();
  }, [fetchTheme]);

  return (
    <ThemeContext.Provider value={{ primaryColor, secondaryColor, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
