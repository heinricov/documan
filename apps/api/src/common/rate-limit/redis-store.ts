import type { RateLimitStore, RateLimitHit } from "./store.js"
import Redis from "ioredis"

/**
 * ============================================================
 *  Redis Rate Limit Store
 * ============================================================
 *
 * Implementasi `RateLimitStore` berbasis Redis menggunakan sliding window.
 * Cocok untuk multi-instance (load-balanced) deployment.
 *
 * Key format: "ratelimit:{key}"
 * Membersihkan expired entries via Lua script untuk atomicity.
 */
export class RedisRateLimitStore implements RateLimitStore {
  private readonly redis: Redis
  private readonly keyPrefix: string

  constructor(
    redisUrl?: string,
    keyPrefix = "ratelimit:"
  ) {
    this.keyPrefix = keyPrefix

    if (!redisUrl) {
      throw new Error("REDIS_URL is required for RedisRateLimitStore")
    }

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null // stop retrying
        return Math.min(times * 200, 2000)
      },
      lazyConnect: true,
    })

    this.redis.on("error", (err) => {
      console.error("[RedisRateLimitStore] Redis connection error:", err)
    })
  }

  async connect(): Promise<void> {
    await this.redis.connect()
  }

  async disconnect(): Promise<void> {
    await this.redis.quit()
  }

  async check(key: string, windowMs: number, max: number): Promise<RateLimitHit> {
    const fullKey = `${this.keyPrefix}${key}`
    const now = Date.now()
    const windowStart = now - windowMs
    const windowSec = Math.ceil(windowMs / 1000)

    // Lua script for atomic sliding window
    // Removes expired entries, counts current, adds new if under limit
    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local max = tonumber(ARGV[3])
      local window_sec = tonumber(ARGV[4])

      -- Remove expired entries
      redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

      -- Count current entries
      local count = redis.call('ZCARD', key)

      if count >= max then
        -- Get oldest entry to calculate retry time
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        if #oldest > 0 then
          local oldest_time = tonumber(oldest[2])
          local retry_after = oldest_time + (window_sec * 1000) - now
          return {0, retry_after}
        end
        return {0, window_sec * 1000}
      end

      -- Add new entry with current timestamp as score
      redis.call('ZADD', key, now, now .. '-' .. math.random())
      -- Set expiry on key (window_sec + 1 second buffer)
      redis.call('EXPIRE', key, window_sec + 1)

      return {1, 0}
    `

    const result = await this.redis.eval(
      script,
      1,
      fullKey,
      now.toString(),
      windowStart.toString(),
      max.toString(),
      windowSec.toString()
    ) as [number, number]

    const [allowed, retryAfterMs] = result

    return {
      allowed: allowed === 1,
      retryAfterMs: retryAfterMs > 0 ? retryAfterMs : undefined,
    }
  }

  async prune(now: number): Promise<void> {
    // Not needed - Redis handles expiry via EXPIRE on keys
    // This is a no-op for Redis store
  }

  async destroy(): Promise<void> {
    await this.disconnect()
  }
}