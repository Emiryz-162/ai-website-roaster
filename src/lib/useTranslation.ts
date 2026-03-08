import { translations, TranslationKey, Translations } from "@/i18n/translations";

export function useTranslation(language: string): { t: (key: TranslationKey) => string } {
  const dict: Translations = translations[language] ?? translations["en"];

  function t(key: TranslationKey): string {
    return dict[key] || translations["en"][key] || key;
  }

  return { t };
}
