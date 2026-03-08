interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();
const MAX_TOKENS = parseInt(process.env.RATE_LIMIT || "30", 10);
const REFILL_INTERVAL_MS = 60_000; // 1 minute

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    const periods = Math.floor(elapsed / REFILL_INTERVAL_MS);
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + periods * MAX_TOKENS);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0 };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 5 * 60_000;
    for (const [ip, bucket] of buckets) {
      if (bucket.lastRefill < cutoff) buckets.delete(ip);
    }
  }, 5 * 60_000).unref?.();
}
