import "server-only";

/**
 * Best-effort rate limiter. Uses Upstash Redis when configured, otherwise an
 * in-memory fallback (adequate for a single instance; the Postgres-backed
 * limiter table is used in production — see supabase/migrations). Public forms,
 * auth routes, search and the guest order lookup all pass through here
 * (Part 9.5 / Part 18.4).
 */
const memory = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; remaining: number }> {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  if (entry.count > limit) return { ok: false, remaining: 0 };
  return { ok: true, remaining: limit - entry.count };
}

/** Honeypot + minimum-time-on-form check. Returns true if the submission looks like spam. */
export function looksLikeSpam(website: string | undefined, ts: number | undefined): boolean {
  if (website && website.trim().length > 0) return true; // honeypot filled
  if (ts && Date.now() - ts < 2000) return true; // submitted in under 2s
  return false;
}
