import type { NextApiRequest, NextApiResponse } from "next";
import { analyzeWebsite, analyzeFromHTML } from "@/lib/analyze";
import { FetcherError } from "@/lib/fetcher";
import { checkRateLimit } from "@/lib/rateLimiter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const { allowed, remaining } = checkRateLimit(ip);
  res.setHeader("X-RateLimit-Remaining", remaining);
  if (!allowed) {
    return res
      .status(429)
      .json({ error: "Too many requests. Try again in a minute." });
  }

  const { url, html, mode, language = "en" } = req.body;

  if (!url && !html) {
    return res.status(400).json({ error: "URL or HTML upload required" });
  }

  try {
    // Fallback path: user uploaded HTML directly (for bot-protected sites)
    if (html && typeof html === "string") {
      const result = await analyzeFromHTML(html, url || "uploaded-html", language);
      return res.status(200).json(result);
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const result = await analyzeWebsite(url, language);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof FetcherError && err.code === "BOT_PROTECTED") {
      return res.status(200).json({
        error: "Bot protection detected",
        code: "BOT_PROTECTED",
        message:
          "This site blocks automated access. Try uploading the HTML manually.",
      });
    }

    // eslint-disable-next-line no-console
    console.error("Roast error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
