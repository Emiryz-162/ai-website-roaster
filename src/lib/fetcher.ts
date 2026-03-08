const WORKER_URL = process.env.WORKER_URL || "http://localhost:9222";

export interface FetchResult {
  html: string;
  screenshot: string | null;
  status?: number;
}

export class FetcherError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = "FetcherError";
  }
}

/**
 * Fetch website via Playwright worker. Falls back to direct HTTP fetch
 * if the worker is unavailable.
 */
export async function fetchWebsite(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(`${WORKER_URL}/screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await response.json();

    if (data.code === "BOT_PROTECTED") {
      throw new FetcherError(data.error, "BOT_PROTECTED");
    }

    if (!response.ok) {
      throw new FetcherError(data.error || "Worker returned error", data.code);
    }

    return {
      html: data.html,
      screenshot: data.screenshot ?? null,
      status: data.status,
    };
  } catch (err) {
    if (err instanceof FetcherError) throw err;

    // Worker unavailable — fallback to direct HTML fetch
    return fetchHTMLDirect(url);
  }
}

async function fetchHTMLDirect(url: string): Promise<FetchResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });

  if (response.status === 403) {
    throw new FetcherError(
      "Site returned 403 — likely bot protection",
      "BOT_PROTECTED",
    );
  }

  if (!response.ok) {
    throw new FetcherError(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  return { html, screenshot: null, status: response.status };
}
