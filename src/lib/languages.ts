export interface Language {
  code: string;
  flag: string;
  label: string;
  native: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}", label: "English", native: "English" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Spanish", native: "Espa\u00f1ol" },
  { code: "zh", flag: "\u{1F1E8}\u{1F1F3}", label: "Chinese", native: "\u4E2D\u6587" },
  { code: "hi", flag: "\u{1F1EE}\u{1F1F3}", label: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "ar", flag: "\u{1F1F8}\u{1F1E6}", label: "Arabic", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "pt", flag: "\u{1F1F5}\u{1F1F9}", label: "Portuguese", native: "Portugu\u00EAs" },
  { code: "bn", flag: "\u{1F1E7}\u{1F1E9}", label: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "ru", flag: "\u{1F1F7}\u{1F1FA}", label: "Russian", native: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", label: "Japanese", native: "\u65E5\u672C\u8A9E" },
  { code: "tr", flag: "\u{1F1F9}\u{1F1F7}", label: "Turkish", native: "T\u00FCrk\u00E7e" },
];

export const DEFAULT_LANGUAGE = "en";

export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
