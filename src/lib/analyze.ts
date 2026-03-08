import { fetchWebsite, FetcherError } from "./fetcher";
import { generateRoast, RoastResponse } from "./openai";

export interface AnalysisResult {
  roast: RoastResponse;
  screenshot: string | null;
  url: string;
  timestamp: number;
}

export interface AnalysisError {
  message: string;
  code: string;
}

/**
 * Build an analysis object from HTML to send to OpenAI.
 * Extracts basic DOM metrics from the raw HTML string.
 */
function buildAnalysisObject(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const metaDescMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i,
  );
  const imgCount = (html.match(/<img\s/gi) || []).length;
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
  const linkCount = (html.match(/<a\s/gi) || []).length;
  const scriptCount = (html.match(/<script[\s>]/gi) || []).length;
  const styleCount = (html.match(/<style[\s>]/gi) || []).length;
  const hasViewport = /<meta[^>]*viewport/i.test(html);
  const hasH1 = /<h1[\s>]/i.test(html);
  const htmlSize = html.length;

  return {
    url,
    title: titleMatch?.[1] || null,
    metaDescription: metaDescMatch?.[1] || null,
    hasViewport,
    hasH1,
    imgCount,
    imgWithoutAlt,
    linkCount,
    scriptCount,
    inlineStyleCount: styleCount,
    htmlSizeBytes: htmlSize,
    htmlSnippet: html.slice(0, 12000),
  };
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  // Validate URL
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new FetcherError("Only HTTP/HTTPS URLs are supported", "INVALID_URL");
  }

  // Fetch HTML + screenshot via worker (falls back to direct fetch)
  const fetchResult = await fetchWebsite(url);

  // Build analysis object from HTML
  const analysis = buildAnalysisObject(fetchResult.html, url);

  // Call OpenAI with analysis
  const roast = await generateRoast(JSON.stringify(analysis));

  return {
    roast,
    screenshot: fetchResult.screenshot,
    url,
    timestamp: Date.now(),
  };
}

export async function analyzeFromHTML(
  html: string,
  url: string,
): Promise<AnalysisResult> {
  const analysis = buildAnalysisObject(html, url);
  const roast = await generateRoast(JSON.stringify(analysis));

  return {
    roast,
    screenshot: null,
    url,
    timestamp: Date.now(),
  };
}
