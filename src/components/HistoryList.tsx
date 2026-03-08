import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/lib/useTranslation";

export interface HistoryItem {
  url: string;
  headline: string;
  scores: { performance: number; accessibility: number; seo: number };
  timestamp: number;
}

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (url: string) => void;
}

export default function HistoryList({ items, onSelect }: HistoryListProps) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage.code);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-4">
      <h2 className="text-xs font-bold text-smoke/40 uppercase tracking-widest mb-4">
        {t("previousRoasts")}
      </h2>
      <ul className="space-y-2" role="list">
        {items.map((item) => {
          const avgScore = Math.round(
            (item.scores.performance + item.scores.accessibility + item.scores.seo) / 3,
          );
          const scoreColor =
            avgScore >= 80
              ? "text-green-400"
              : avgScore >= 50
                ? "text-yellow-400"
                : "text-red-400";

          return (
            <li key={item.timestamp}>
              <button
                onClick={() => onSelect(item.url)}
                className="w-full text-left px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10
                           rounded-xl hover:border-flame/40 hover:bg-white/[0.07] hover:scale-[1.02]
                           active:scale-[0.99] transition-all duration-200"
              >
                <span className="text-smoke/90 truncate block text-sm">{item.url}</span>
                <span className="text-xs text-smoke/40 mt-0.5 flex items-center gap-2">
                  <span className={`font-bold ${scoreColor}`}>{avgScore}/100</span>
                  <span className="text-smoke/20">·</span>
                  {t("avgScore").replace(":", "")}
                  <span className="text-smoke/20">·</span>
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
