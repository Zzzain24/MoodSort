import { Redis } from '@upstash/redis'

// ─── Redis client (lazy) ────────────────────────────────────────────────────
// Only instantiated when the Upstash env vars are present. Falls back to the
// in-memory store for local development.

const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// ─── In-memory fallback (local dev only) ───────────────────────────────────

interface RateLimitRecord {
  count: number
  resetAt: number
}

const memStore = new Map<string, RateLimitRecord>()

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()

  // Periodic cleanup to avoid unbounded growth
  if (memStore.size > 1000) {
    for (const [k, v] of memStore) {
      if (now > v.resetAt) memStore.delete(k)
    }
  }

  const record = memStore.get(key)
  if (!record || now > record.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (record.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
  }

  record.count++
  return { allowed: true, retryAfter: 0 }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  if (!redis) {
    return memoryRateLimit(key, limit, windowMs)
  }

  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const redisKey = `rl:${key}:${window}`
  const resetAt = (window + 1) * windowMs

  const count = await redis.incr(redisKey)
  if (count === 1) {
    // Set TTL slightly longer than the window to avoid a race at the boundary
    await redis.pexpire(redisKey, windowMs + 1000)
  }

  if (count > limit) {
    return { allowed: false, retryAfter: Math.ceil((resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfter: 0 }
}
