import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import { Mail, Github, Linkedin } from "lucide-react";
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
        <meta name="description" content={t("subtitle")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AnimatedBackground>
        <div className="min-h-screen flex flex-col">
          {/* ── Top nav bar ─────────────────────────────────────────── */}
          <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5">
            {/* Logo */}
            <Image
              src="/logo.svg"
              alt="AI Website Roaster"
              width={160}
              height={36}
              priority
            />
            <LanguageSelector />
          </nav>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main
            className="flex-1 flex flex-col items-center px-4 sm:px-8 pt-16 pb-20 gap-12"
            id="main-content"
          >
            {/* Hero */}
            <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-5">
              {/* Title with gradient */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight
                           bg-gradient-to-br from-flame via-orange-300 to-yellow-200
                           bg-clip-text text-transparent"
              >
                {t("title")}
              </h1>

              {/* Subtitle */}
              <p className="text-smoke/60 text-lg sm:text-xl max-w-xl leading-relaxed">
                {t("subtitle")}
              </p>
            </section>

            {/* URL input */}
            <UrlInput onSubmit={handleRoast} isLoading={isLoading} progress={progress} />

            {/* Error */}
            {error && (
              <div
                className="w-full max-w-2xl px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20
                           text-red-400 text-sm text-center"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Bot protection fallback */}
            {botProtected && (
              <FallbackUpload
                url={botProtected}
                onSubmit={handleFallbackSubmit}
                isLoading={isLoading}
              />
            )}

            {/* Result */}
            {result && <RoastResult result={result} />}

            {/* History */}
            <HistoryList items={history} onSelect={handleRoast} />
          </main>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <footer className="w-full border-t border-white/5 py-6 px-6">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="text-xs text-smoke/30">© 2026 Emir Yılmaz</p>

              {/* Social icons */}
              <div className="flex items-center gap-5">
                <a
                  href="mailto:yz.emir@hotmail.com"
                  aria-label="Send email"
                  className="text-smoke/30 hover:text-flame transition-colors duration-200"
                >
                  <Mail size={16} />
                </a>
                <a
                  href="https://github.com/Emiryz-162"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="text-smoke/30 hover:text-flame transition-colors duration-200"
                >
                  <Github size={16} />
                </a>
                <a
                  href="https://www.linkedin.com/in/emir-y/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="text-smoke/30 hover:text-flame transition-colors duration-200"
                >
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
          </footer>
        </div>
      </AnimatedBackground>
    </>
  );
}
