import type { NextApiRequest, NextApiResponse } from "next";
import { saveRoast, StoredRoast } from "@/lib/roastStore";

interface ShareRequest {
  url: string;
  result: StoredRoast["result"];
}

interface ShareResponse {
  id: string;
  shareUrl: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShareResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, result } = req.body as Partial<ShareRequest>;

  if (!url || !result) {
    return res.status(400).json({ error: "url and result are required" });
  }

  const entry = saveRoast(url, result);

  return res.status(200).json({
    id: entry.id,
    shareUrl: `/roast/${entry.id}`,
  });
}
