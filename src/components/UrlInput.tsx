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
      className="flex flex-col items-center gap-5 w-full max-w-2xl"
      role="search"
    >
      <label htmlFor="url-input" className="sr-only">
        {t("urlLabel")}
      </label>
      <div className="relative w-full group">
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("urlPlaceholder")}
          className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl
                     text-smoke placeholder-smoke/40
                     focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/30
                     hover:border-white/20
                     transition-all duration-200 text-lg shadow-lg"
          disabled={isLoading}
          autoComplete="url"
          aria-label={t("urlLabel")}
        />
      </div>

      <fieldset className="flex gap-3 flex-wrap justify-center">
        <legend className="sr-only">{t("analysisModeLabel")}</legend>
        {modes.map((m) => (
          <label
            key={m.value}
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer border transition-all duration-200
              ${
                mode === m.value
                  ? "border-flame bg-flame/10 text-flame shadow-[0_0_12px_rgba(255,107,53,0.15)]"
                  : "border-white/10 text-smoke/60 hover:border-white/25 hover:text-smoke/80 bg-white/5"
              }`}
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
        className="px-10 py-3.5 bg-flame text-charcoal font-bold rounded-xl
                   hover:bg-flame/90 hover:brightness-110
                   active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                   transition-all duration-200 text-lg shadow-lg shadow-flame/20"
      >
        {isLoading ? t("roastingButton") : t("roastButton")}
      </button>

      {isLoading && progress && (
        <div
          className="flex items-center gap-2 text-smoke/60 text-sm"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block w-3 h-3 border-2 border-flame border-t-transparent rounded-full animate-spin" />
          {progress}
        </div>
      )}
    </form>
  );
}
