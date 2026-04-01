interface RateLimitRecord {
  count: number
  resetAt: number
}

// NOTE: in-memory store — resets on cold start. For multi-instance deployments
// swap this for an Upstash Redis or Vercel KV backed implementation.
const store = new Map<string, RateLimitRecord>()

let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 60_000

function maybeCleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key)
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  maybeCleanup()
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (record.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
  }

  record.count++
  return { allowed: true, retryAfter: 0 }
}
