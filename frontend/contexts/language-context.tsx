"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "mn" | "ja";

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  getText: (en: string, mn: string, ja: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("mn");

  // Language helper function
  const getText = (en: string, mn: string, ja: string) => {
    switch (currentLanguage) {
      case "en":
        return en;
      case "ja":
        return ja;
      default:
        return mn; // default is Mongolian
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, getText }}>
      {children}
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