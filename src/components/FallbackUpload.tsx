import { useState, ChangeEvent } from "react";

interface FallbackUploadProps {
  url: string;
  onSubmit: (html: string) => void;
  isLoading: boolean;
}

export default function FallbackUpload({ url, onSubmit, isLoading }: FallbackUploadProps) {
  const [html, setHtml] = useState("");

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-xl space-y-4 p-6 border-2 border-flame/30 rounded-lg bg-charcoal/50">
      <p className="text-flame font-bold">Bot protection detected</p>
      <p className="text-smoke/70 text-sm">
        <strong>{url}</strong> blocked automated access. Paste the page HTML below,
        or upload an HTML file (View Source in your browser with Ctrl+U).
      </p>
      <label htmlFor="html-paste" className="sr-only">
        Paste HTML source
      </label>
      <textarea
        id="html-paste"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="Paste HTML here..."
        className="w-full h-40 px-4 py-3 bg-charcoal border border-smoke/20 rounded-lg
                   text-smoke/80 text-sm font-mono resize-y focus:border-flame focus:outline-none"
        disabled={isLoading}
      />
      <label htmlFor="html-file" className="block text-sm text-smoke/50">
        Or upload an HTML file:
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
        className="px-6 py-2 bg-flame text-charcoal font-bold rounded-lg
                   hover:bg-flame/90 disabled:opacity-50 transition-all"
      >
        {isLoading ? "Roasting..." : "Roast from HTML"}
      </button>
    </div>
  );
}
