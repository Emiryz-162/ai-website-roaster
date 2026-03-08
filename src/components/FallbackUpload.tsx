import { useState, ChangeEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/lib/useTranslation";

interface FallbackUploadProps {
  url: string;
  onSubmit: (html: string) => void;
  isLoading: boolean;
}

export default function FallbackUpload({ url, onSubmit, isLoading }: FallbackUploadProps) {
  const [html, setHtml] = useState("");
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-xl space-y-4 p-6 border border-flame/30 rounded-xl bg-white/5 backdrop-blur-md shadow-lg">
      <p className="text-flame font-bold">{t("botProtectionDetected")}</p>
      <p className="text-smoke/70 text-sm">
        <strong>{url}</strong> {t("botProtectionDesc")}
      </p>
      <label htmlFor="html-paste" className="sr-only">
        {t("htmlPastePlaceholder")}
      </label>
      <textarea
        id="html-paste"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder={t("htmlPastePlaceholder")}
        className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                   text-smoke/80 text-sm font-mono resize-y focus:border-flame focus:outline-none"
        disabled={isLoading}
      />
      <label htmlFor="html-file" className="block text-sm text-smoke/50">
        {t("htmlFileLabel")}
      </label>
      <input
        id="html-file"
        type="file"
        accept=".html,.htm,.txt"
        onChange={handleFileUpload}
        className="block text-sm text-smoke/50"
      />
      <button
        onClick={() => onSubmit(html)}
        disabled={isLoading || !html.trim()}
        className="px-6 py-2.5 bg-flame text-charcoal font-bold rounded-xl
                   hover:bg-flame/90 hover:brightness-110 active:scale-95
                   disabled:opacity-50 disabled:active:scale-100 transition-all duration-200"
      >
        {isLoading ? t("roastingButton") : t("roastFromHtml")}
      </button>
    </div>
  );
}
