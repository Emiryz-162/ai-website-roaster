import { RoastResponse } from "@/lib/openai";

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
      <span className="w-32 text-sm text-smoke/70 text-right">{label}</span>
      <div className="flex-1 h-3 bg-smoke/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="w-10 text-sm text-smoke/80 font-bold">{score}</span>
    </div>
  );
}

export default function RoastResult({ result }: RoastResultProps) {
  const { roast, screenshot, url } = result;

  const handleCopy = () => {
    const text = `${roast.headline}\n\n${roast.roast}\n\nScores:\n- Performance: ${roast.scores.performance}/100\n- Accessibility: ${roast.scores.accessibility}/100\n- SEO: ${roast.scores.seo}/100\n\nIssues:\n${roast.issues.map((i) => `- [${i.severity}] ${i.title}: ${i.description}`).join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Headline & Roast */}
      <div className="bg-charcoal/50 border border-flame/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-flame mb-2">{roast.headline}</h2>
        <p className="text-lg text-smoke/90 italic">&ldquo;{roast.roast}&rdquo;</p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className={`${confidenceColors[roast.confidence] || "text-smoke/50"}`}>
            Confidence: {roast.confidence}
          </span>
          <span className="text-smoke/40">|</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame/70 hover:text-flame underline"
          >
            {url}
          </a>
        </div>
      </div>

      {/* Screenshot */}
      {screenshot && (
        <div className="rounded-lg overflow-hidden border border-smoke/10">
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt={`Screenshot of ${url}`}
            className="w-full"
          />
        </div>
      )}

      {/* Scores */}
      <div className="bg-charcoal/50 border border-smoke/10 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-smoke mb-3">Scores</h3>
        <ScoreBar label="Performance" score={roast.scores.performance} />
        <ScoreBar label="Accessibility" score={roast.scores.accessibility} />
        <ScoreBar label="SEO" score={roast.scores.seo} />
      </div>

      {/* Issues */}
      {roast.issues.length > 0 && (
        <div className="bg-charcoal/50 border border-smoke/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-smoke mb-4">Issues Found</h3>
          <ul className="space-y-3">
            {roast.issues.map((issue, i) => (
              <li
                key={i}
                className="border border-smoke/10 rounded-lg p-4 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded border ${severityColors[issue.severity]}`}
                  >
                    {issue.severity}
                  </span>
                  <span className="font-bold text-smoke">{issue.title}</span>
                </div>
                <p className="text-sm text-smoke/70">{issue.description}</p>
                {issue.evidence && (
                  <pre className="text-xs text-smoke/50 bg-charcoal/80 rounded p-2 overflow-x-auto mt-2">
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
        <div className="bg-charcoal/50 border border-smoke/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-smoke mb-4">Suggested Fixes</h3>
          <ul className="space-y-4">
            {roast.fixes.map((fix, i) => (
              <li key={i} className="space-y-1">
                <p className="text-sm font-bold text-flame">{fix.issueTitle}</p>
                <p className="text-sm text-smoke/80">{fix.suggestion}</p>
                {fix.codeSnippet && (
                  <pre className="text-xs text-green-400 bg-charcoal/80 rounded p-3 overflow-x-auto mt-1">
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
        <div className="bg-charcoal/50 border border-smoke/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-smoke mb-3">Action Plan</h3>
          <ol className="list-decimal list-inside space-y-2">
            {roast.actionable_steps.map((step, i) => (
              <li key={i} className="text-sm text-smoke/80">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleCopy}
          className="px-4 py-2 border border-smoke/20 rounded-lg text-sm text-smoke/70
                     hover:border-flame/50 hover:text-flame transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
