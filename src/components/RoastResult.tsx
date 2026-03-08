import { RoastResponse } from "@/lib/openai";
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

export default function RoastResult({ result }: RoastResultProps) {
  const { roast, screenshot, url } = result;
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  const handleCopy = () => {
    const text = `${roast.headline}\n\n${roast.roast}\n\n${t("scores")}:\n- ${t("performance")}: ${roast.scores.performance}/100\n- ${t("accessibility")}: ${roast.scores.accessibility}/100\n- ${t("seo")}: ${roast.scores.seo}/100\n\n${t("issuesFound")}:\n${roast.issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  return (
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
        <h3 className="text-base font-bold text-smoke/80 uppercase tracking-widest text-xs mb-4">
          {t("scores")}
        </h3>
        <ScoreBar label={t("performance")} score={roast.scores.performance} />
        <ScoreBar label={t("accessibility")} score={roast.scores.accessibility} />
        <ScoreBar label={t("seo")} score={roast.scores.seo} />
      </div>

      {/* Issues */}
      {roast.issues.length > 0 && (
        <div className={cardClass}>
          <h3 className="text-base font-bold text-smoke/80 uppercase tracking-widest text-xs mb-5">
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
          <h3 className="text-base font-bold text-smoke/80 uppercase tracking-widest text-xs mb-5">
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
          <h3 className="text-base font-bold text-smoke/80 uppercase tracking-widest text-xs mb-4">
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

      {/* Actions */}
      <div className="flex gap-3 justify-center pb-4">
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 border border-white/10 rounded-xl text-sm text-smoke/70
                     bg-white/5 backdrop-blur-md hover:bg-white/10 hover:text-flame
                     hover:brightness-110 active:scale-95
                     transition-all duration-200"
        >
          {t("copyClipboard")}
        </button>
      </div>
    </div>
  );
}
