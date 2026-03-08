import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, LANGUAGES, getLanguageByCode } from "@/lib/languages";

const STORAGE_KEY = "roaster-language";
// Separate flag so we can distinguish a manual pick from an auto-detected one
const MANUAL_KEY = "roaster-language-manual";

interface LanguageContextValue {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLanguage: LANGUAGES[0],
  setLanguage: () => {},
});

/** Extract a supported language code from navigator.language ("tr-TR" → "tr"). */
function detectBrowserLanguage(): string {
  if (typeof navigator === "undefined") return "en";
  const raw = navigator.language ?? "";
  const code = raw.split("-")[0].toLowerCase();
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    try {
      const manual = localStorage.getItem(MANUAL_KEY);
      if (manual) {
        // User has explicitly chosen a language before — honour it
        setCurrentLanguage(getLanguageByCode(manual));
      } else {
        // First visit: auto-detect from browser
        const detected = detectBrowserLanguage();
        setCurrentLanguage(getLanguageByCode(detected));
        // Store in STORAGE_KEY so subsequent renders are stable,
        // but NOT in MANUAL_KEY so a true manual choice can override it later.
        localStorage.setItem(STORAGE_KEY, detected);
      }
    } catch {
      // ignore localStorage errors (SSR / private-browsing edge cases)
    }
  }, []);

  const setLanguage = (code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguage(lang);
    try {
      // Write both keys so the manual preference survives page reloads
      localStorage.setItem(STORAGE_KEY, code);
      localStorage.setItem(MANUAL_KEY, code);
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
