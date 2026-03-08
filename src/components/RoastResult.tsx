import { useState } from "react";
import { RoastResponse } from "@/lib/openai";
import { TranslationKey } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/lib/useTranslation";

interface RoastResultProps {
  result: {
    roast: RoastResponse;
    screenshot: string | null;
    url: string;
    timestamp: number;
  };
}

const severityColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const confidenceColors: Record<string, string> = {
  low: "text-red-400",
  medium: "text-yellow-400",
  high: "text-green-400",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-smoke/70 ltr:text-right rtl:text-left">{label}</span>
      <div className="flex-1 h-2.5 bg-smoke/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="w-10 text-sm text-smoke/80 font-bold">{score}</span>
    </div>
  );
}

const cardClass =
  "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 hover:scale-[1.02] transition-all duration-300";

// ── Share Modal ──────────────────────────────────────────────────────────────

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
  t: (key: TranslationKey) => string;
}

function ShareModal({ shareUrl, onClose, t }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("shareModalTitle")}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-[#0f172a]/95 border border-white/15 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-flame text-lg" aria-hidden="true">🔗</span>
            <h2 className="text-base font-bold text-smoke">{t("shareModalTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-smoke/40 hover:text-smoke/80 transition-colors p-1 rounded-lg hover:bg-white/5 active:scale-95"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* URL display */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
          <span className="flex-1 text-sm text-smoke/80 truncate font-mono">{shareUrl}</span>
        </div>

        {/* Expiry notice */}
        <p className="text-xs text-smoke/35 text-center">{t("roastExpiry")}</p>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200
            active:scale-95
            ${
              copied
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "bg-flame text-charcoal hover:bg-flame/90 hover:brightness-110 shadow-lg shadow-flame/20"
            }`}
        >
          {copied ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t("linkCopied")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t("copyLink")}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function RoastResult({ result }: RoastResultProps) {
  const { roast, screenshot, url } = result;
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleCopy = () => {
    const text = `${roast.headline}\n\n${roast.roast}\n\n${t("scores")}:\n- ${t("performance")}: ${roast.scores.performance}/100\n- ${t("accessibility")}: ${roast.scores.accessibility}/100\n- ${t("seo")}: ${roast.scores.seo}/100\n\n${t("issuesFound")}:\n${roast.issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.url, result }),
      });
      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
      setShareModalOpen(true);
    } catch {
      // If sharing fails silently, could add a toast here
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* Share modal */}
      {shareModalOpen && shareUrl && (
        <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShareModalOpen(false)}
          t={t}
        />
      )}

      <div className="w-full max-w-2xl mx-auto space-y-5">
        {/* Headline & Roast */}
        <div className={cardClass}>
          <h2 className="text-2xl font-bold text-flame mb-2">{roast.headline}</h2>
          <p className="text-lg text-smoke/90 italic leading-relaxed">&ldquo;{roast.roast}&rdquo;</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className={`${confidenceColors[roast.confidence] || "text-smoke/50"}`}>
              {t("confidence")} {roast.confidence}
            </span>
            <span className="text-smoke/30">|</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame/70 hover:text-flame underline transition-colors truncate max-w-xs"
            >
              {url}
            </a>
          </div>
        </div>

        {/* Screenshot */}
        {screenshot && (
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg hover:scale-[1.02] transition-all duration-300">
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt={`Screenshot of ${url}`}
              className="w-full"
            />
          </div>
        )}

        {/* Scores */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className="text-xs font-bold text-smoke/50 uppercase tracking-widest mb-4">
            {t("scores")}
          </h3>
          <ScoreBar label={t("performance")} score={roast.scores.performance} />
          <ScoreBar label={t("accessibility")} score={roast.scores.accessibility} />
          <ScoreBar label={t("seo")} score={roast.scores.seo} />
        </div>

        {/* Issues */}
        {roast.issues.length > 0 && (
          <div className={cardClass}>
            <h3 className="text-xs font-bold text-smoke/50 uppercase tracking-widest mb-5">
              {t("issuesFound")}
            </h3>
            <ul className="space-y-3">
              {roast.issues.map((issue, i) => (
                <li
                  key={i}
                  className="border border-white/5 rounded-lg p-4 space-y-1.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded border ${severityColors[issue.severity]}`}
                    >
                      {issue.severity}
                    </span>
                    <span className="font-semibold text-smoke">{issue.title}</span>
                  </div>
                  <p className="text-sm text-smoke/70 leading-relaxed">{issue.description}</p>
                  {issue.evidence && (
                    <pre className="text-xs text-smoke/50 bg-charcoal/80 rounded-lg p-3 overflow-x-auto mt-2">
                      {issue.evidence}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fixes */}
        {roast.fixes.length > 0 && (
          <div className={cardClass}>
            <h3 className="text-xs font-bold text-smoke/50 uppercase tracking-widest mb-5">
              {t("suggestedFixes")}
            </h3>
            <ul className="space-y-5">
              {roast.fixes.map((fix, i) => (
                <li key={i} className="space-y-2">
                  <p className="text-sm font-bold text-flame">{fix.issueTitle}</p>
                  <p className="text-sm text-smoke/80 leading-relaxed">{fix.suggestion}</p>
                  {fix.codeSnippet && (
                    <pre className="text-xs text-green-400 bg-charcoal/80 rounded-lg p-3 overflow-x-auto">
                      {fix.codeSnippet}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Steps */}
        {roast.actionable_steps.length > 0 && (
          <div className={cardClass}>
            <h3 className="text-xs font-bold text-smoke/50 uppercase tracking-widest mb-4">
              {t("actionPlan")}
            </h3>
            <ol className="space-y-3">
              {roast.actionable_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-smoke/80 leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flame/20 text-flame text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Actions row */}
        <div className="flex gap-3 justify-center flex-wrap pb-4">
          {/* Copy to clipboard */}
          <button
            onClick={handleCopy}
            className="px-5 py-2.5 border border-white/10 rounded-xl text-sm text-smoke/70
                       bg-white/5 backdrop-blur-md hover:bg-white/10 hover:text-flame
                       hover:brightness-110 active:scale-95
                       transition-all duration-200"
          >
            {t("copyClipboard")}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-flame/15 border border-flame/30 text-flame
                       hover:bg-flame/25 hover:border-flame/50
                       active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {isSharing ? t("sharing") : t("shareButton")}
          </button>
        </div>
      </div>
    </>
  );
}
