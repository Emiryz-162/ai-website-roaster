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
    <div className="w-full max-w-xl mt-8">
      <h2 className="text-xl font-bold text-flame mb-4">{t("previousRoasts")}</h2>
      <ul className="space-y-2" role="list">
        {items.map((item) => {
          const avgScore = Math.round(
            (item.scores.performance + item.scores.accessibility + item.scores.seo) / 3,
          );
          return (
            <li key={item.timestamp}>
              <button
                onClick={() => onSelect(item.url)}
                className="w-full text-left px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10
                           rounded-xl hover:border-flame/50 hover:scale-[1.01] transition-all"
              >
                <span className="text-smoke truncate block">{item.url}</span>
                <span className="text-sm text-smoke/50">
                  {t("avgScore")} {avgScore}/100 &mdash;{" "}
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
