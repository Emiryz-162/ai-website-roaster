import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/languages";

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/5 backdrop-blur-md border border-white/10
                   hover:bg-white/10 transition-colors text-smoke text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.native}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-48 py-1 rounded-xl
                     bg-charcoal/90 backdrop-blur-md border border-white/10
                     shadow-xl z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Available languages"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="option" aria-selected={currentLanguage.code === lang.code}>
              <button
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${
                    currentLanguage.code === lang.code
                      ? "bg-flame/20 text-flame"
                      : "text-smoke/80 hover:bg-white/5 hover:text-smoke"
                  }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.native}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
