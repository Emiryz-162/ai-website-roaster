import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from "@/lib/languages";

const STORAGE_KEY = "roaster-language";

interface LanguageContextValue {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCurrentLanguage(getLanguageByCode(saved));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const setLanguage = (code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore localStorage errors
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
