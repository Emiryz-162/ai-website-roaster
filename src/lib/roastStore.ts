import crypto from "crypto";
import type { RoastResponse } from "@/lib/openai";

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredRoast {
  id: string;
  url: string;
  result: {
    roast: RoastResponse;
    screenshot: string | null;
    url: string;
    timestamp: number;
  };
  createdAt: number;
}

const store = new Map<string, StoredRoast>();

function purgeExpired() {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, entry] of store) {
    if (entry.createdAt < cutoff) store.delete(id);
  }
}

// Purge expired entries every hour without blocking process exit
if (typeof setInterval !== "undefined") {
  setInterval(purgeExpired, 60 * 60 * 1000).unref?.();
}

export function saveRoast(
  url: string,
  result: StoredRoast["result"],
): StoredRoast {
  purgeExpired();
  // Generate a short, URL-safe 8-character ID
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const entry: StoredRoast = { id, url, result, createdAt: Date.now() };
  store.set(id, entry);
  return entry;
}

export function getRoast(id: string): StoredRoast | undefined {
  const entry = store.get(id);
  if (!entry) return undefined;
  // Lazy expiry check
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(id);
    return undefined;
  }
  return entry;
}
