import { InMemoryRateLimitStore } from "./in-memory-store.js"
import { RedisRateLimitStore } from "./redis-store.js"
import type { RateLimitStore } from "./store.js"

/**
 * ============================================================
 *  Rate Limit Store Factory
 * ============================================================
 *
 * Memilih implementasi store berdasarkan env:
 * - REDIS_URL set → RedisRateLimitStore
 * - REDIS_URL tidak set → InMemoryRateLimitStore (fallback)
 */
export async function createRateLimitStore(): Promise<RateLimitStore> {
  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    const store = new RedisRateLimitStore(redisUrl)
    await store.connect()
    console.log("[RateLimit] Using Redis store")
    return store
  }

  console.log("[RateLimit] Using InMemory store (REDIS_URL not set)")
  return new InMemoryRateLimitStore()
}

/**
 * Synchronous factory for DI (when async not available).
 * Uses lazy Redis connection.
 */
export function createRateLimitStoreSync(): RateLimitStore {
  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    console.log("[RateLimit] Using Redis store (lazy connect)")
    return new RedisRateLimitStore(redisUrl)
  }

  console.log("[RateLimit] Using InMemory store (REDIS_URL not set)")
  return new InMemoryRateLimitStore()
}