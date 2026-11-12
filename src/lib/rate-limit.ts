import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";

/**
 * Simple in-memory fixed-window rate limiter. Suitable for a single server
 * instance. For multi-instance deployments, swap for Redis/Upstash.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    }
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryAfterMs: bucket.resetAt - now };
}

export async function clientIp() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

/** Store only a salted hash of the IP — never the raw address. */
export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${ip}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}
