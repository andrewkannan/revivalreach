"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type TextSize = "normal" | "large";

interface PreferencesContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [textSize, setTextSizeState] = useState<TextSize>("normal");

  useEffect(() => {
    // Load preferences from localStorage
    const savedTheme = localStorage.getItem("preferredTheme") as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    
    const savedTextSize = localStorage.getItem("preferredTextSize") as TextSize;
    if (savedTextSize && ["normal", "large"].includes(savedTextSize)) {
      setTextSizeState(savedTextSize);
    }
  }, []);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    } else if (theme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      root.classList.remove("light-theme", "dark-theme");
    }
  }, [theme]);

  useEffect(() => {
    // Apply text size
    const root = document.documentElement;
    if (textSize === "large") {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
  }, [textSize]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("preferredTheme", newTheme);
  };

  const setTextSize = (newSize: TextSize) => {
    setTextSizeState(newSize);
    localStorage.setItem("preferredTextSize", newSize);
  };

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, textSize, setTextSize }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
