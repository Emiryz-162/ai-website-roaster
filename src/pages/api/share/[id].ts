import type { NextApiRequest, NextApiResponse } from "next";
import { getRoast, StoredRoast } from "@/lib/roastStore";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoredRoast | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  const entry = getRoast(id);
  if (!entry) {
    return res.status(404).json({ error: "Roast not found or has expired" });
  }

  return res.status(200).json(entry);
}
