"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "@/locales/en";
import { ta } from "@/locales/ta";

type Language = "en" | "ta";
type Dictionary = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Dictionary) => string;
}

const dictionaries: Record<Language, Dictionary> = {
  en,
  ta,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language on client side
    const saved = localStorage.getItem("preferredLanguage") as Language;
    if (saved && (saved === "en" || saved === "ta")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (key: keyof Dictionary): string => {
    return dictionaries[language][key] || dictionaries["en"][key] || key;
  };

  // Prevent hydration mismatch by rendering kids only after local storage is checked,
  // or just render default language if SSR.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div key={language} style={{ display: 'contents' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
