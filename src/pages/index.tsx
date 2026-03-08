import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import UrlInput from "@/components/UrlInput";
import RoastResult from "@/components/RoastResult";
import HistoryList, { HistoryItem } from "@/components/HistoryList";
import FallbackUpload from "@/components/FallbackUpload";
import LanguageSelector from "@/components/LanguageSelector";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/lib/useTranslation";
import type { RoastResponse } from "@/lib/openai";

interface AnalysisResult {
  roast: RoastResponse;
  screenshot: string | null;
  url: string;
  timestamp: number;
}

const HISTORY_KEY = "roast-history";
const MAX_HISTORY = 10;

export default function Home() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [botProtected, setBotProtected] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  // RTL support for Arabic
  useEffect(() => {
    document.documentElement.dir = currentLanguage.code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage.code]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  const addToHistory = useCallback(
    (res: AnalysisResult) => {
      const item: HistoryItem = {
        url: res.url,
        headline: res.roast.headline,
        scores: res.roast.scores,
        timestamp: res.timestamp,
      };
      const updated = [item, ...history.filter((h) => h.url !== res.url)].slice(
        0,
        MAX_HISTORY,
      );
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    },
    [history],
  );

  const simulateProgress = useCallback(() => {
    const steps = [
      t("progressFetching"),
      t("progressScreenshot"),
      t("progressAnalyzing"),
      t("progressGenerating"),
    ];
    let step = 0;
    setProgress(steps[0]);
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setProgress(steps[step]);
      } else {
        clearInterval(interval);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [t]);

  const handleRoast = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setBotProtected(null);
    setResult(null);

    const clearProgress = simulateProgress();

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language: currentLanguage.code }),
      });

      const data = await res.json();

      if (data.code === "BOT_PROTECTED") {
        setBotProtected(url);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
      addToHistory(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setProgress(null);
      clearProgress();
    }
  };

  const handleFallbackSubmit = async (html: string) => {
    setIsLoading(true);
    setError(null);
    setProgress(t("progressFromHtml"));

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: botProtected, html, language: currentLanguage.code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      setBotProtected(null);
      addToHistory(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <meta
          name="description"
          content={t("subtitle")}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AnimatedBackground>
        <main className="flex min-h-screen flex-col items-center p-8 gap-8">
          <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-center ltr:sm:text-left rtl:sm:text-right">
              <h1 className="text-4xl sm:text-5xl font-bold text-flame">{t("title")}</h1>
              <p className="mt-2 text-smoke/60 text-base sm:text-lg">
                {t("subtitle")}
              </p>
            </div>
            <LanguageSelector />
          </header>

          <UrlInput onSubmit={handleRoast} isLoading={isLoading} progress={progress} />

          {error && (
            <p className="text-red-400 max-w-xl text-center" role="alert">
              {error}
            </p>
          )}

          {botProtected && (
            <FallbackUpload
              url={botProtected}
              onSubmit={handleFallbackSubmit}
              isLoading={isLoading}
            />
          )}

          {result && <RoastResult result={result} />}

          <HistoryList items={history} onSelect={handleRoast} />

          <footer className="mt-auto py-6 text-center text-sm text-smoke/30">
            {t("footer")}
          </footer>
        </main>
      </AnimatedBackground>
    </>
  );
}
