import type { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit } from "@/lib/rateLimiter";

export const config = {
  api: { bodyParser: { sizeLimit: "2mb" } },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const { html } = req.body;
  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "HTML string required in body" });
  }

  // HTML is processed in-memory only — not persisted (24h retention policy)
  return res.status(200).json({ html, received: true });
}
