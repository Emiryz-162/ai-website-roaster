import { useState, FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/lib/useTranslation";

type RoastMode = "screenshot" | "html" | "lighthouse";

interface UrlInputProps {
  onSubmit: (url: string, mode: RoastMode) => void;
  isLoading: boolean;
  progress: string | null;
}

export default function UrlInput({ onSubmit, isLoading, progress }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<RoastMode>("screenshot");
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    onSubmit(normalizedUrl, mode);
  };

  const modes: { value: RoastMode; labelKey: "screenshotMode" | "htmlMode" | "lighthouseMode" }[] =
    [
      { value: "screenshot", labelKey: "screenshotMode" },
      { value: "html", labelKey: "htmlMode" },
      { value: "lighthouse", labelKey: "lighthouseMode" },
    ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 w-full max-w-xl"
      role="search"
    >
      <label htmlFor="url-input" className="sr-only">
        {t("urlLabel")}
      </label>
      <div className="relative w-full">
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("urlPlaceholder")}
          className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl
                     text-smoke placeholder-smoke/40 focus:border-flame focus:outline-none
                     transition-colors text-lg shadow-lg"
          disabled={isLoading}
          autoComplete="url"
        />
      </div>

      <fieldset className="flex gap-4 flex-wrap justify-center">
        <legend className="sr-only">{t("analysisModeLabel")}</legend>
        {modes.map((m) => (
          <label
            key={m.value}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer border transition-all
              ${mode === m.value ? "border-flame bg-flame/10 text-flame" : "border-white/10 text-smoke/60 hover:border-smoke/30 bg-white/5"}`}
          >
            <input
              type="radio"
              name="mode"
              value={m.value}
              checked={mode === m.value}
              onChange={() => setMode(m.value)}
              className="sr-only"
            />
            {t(m.labelKey)}
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="px-8 py-3 bg-flame text-charcoal font-bold rounded-xl
                   hover:bg-flame/90 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all text-lg shadow-lg"
      >
        {isLoading ? t("roastingButton") : t("roastButton")}
      </button>

      {isLoading && progress && (
        <div className="flex items-center gap-2 text-smoke/60 text-sm" role="status" aria-live="polite">
          <span className="inline-block w-3 h-3 border-2 border-flame border-t-transparent rounded-full animate-spin" />
          {progress}
        </div>
      )}
    </form>
  );
}
