import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/languages";

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/5 backdrop-blur-md border border-white/10
                   hover:bg-white/10 hover:border-white/20
                   active:scale-95
                   transition-all duration-200 text-smoke text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <span>{currentLanguage.native}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-48 py-1.5 rounded-xl
                     bg-[#0f172a]/95 backdrop-blur-xl border border-white/10
                     shadow-2xl z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Available languages"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <li key={lang.code} role="option" aria-selected={isSelected}>
                <button
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
                    ${
                      isSelected
                        ? "bg-flame/15 text-flame font-medium"
                        : "text-smoke/70 hover:bg-white/5 hover:text-smoke"
                    }`}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {lang.flag}
                  </span>
                  <span>{lang.native}</span>
                  {isSelected && (
                    <svg
                      className="w-3 h-3 ml-auto text-flame"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
