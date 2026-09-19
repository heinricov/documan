import type { RateLimitStore, RateLimitHit } from "./store.js"

/**
 * ============================================================
 *  In-Memory Rate Limit Store
 * ============================================================
 *
 * Implementasi default `RateLimitStore` berbasis Map di memory.
 * Tepat untuk 1 instance / development. Tidak shared antar proses.
 *
 * Data disimpan sebagai timestamp per key; entry lama dibersihkan
 * secara periodik via `prune()`.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly hits = new Map<string, number[]>()
  private readonly interval: ReturnType<typeof setInterval> | null = null

  constructor(
    /** Interval prune (ms). 0 = tidak auto-prune. */
    pruneIntervalMs = 60_000
  ) {
    if (pruneIntervalMs > 0) {
      this.interval = setInterval(() => this.prune(Date.now()), pruneIntervalMs)
      this.interval.unref()
    }
  }

  check(key: string, windowMs: number, max: number): RateLimitHit {
    const now = Date.now()
    const cutoff = now - windowMs
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > cutoff)

    if (timestamps.length >= max) {
      const oldest = timestamps[0]!
      return { allowed: false, retryAfterMs: oldest + windowMs - now }
    }

    timestamps.push(now)
    this.hits.set(key, timestamps)

    return { allowed: true }
  }

  prune(now: number): void {
    // Gunakan ttl yang cukup lama untuk cleanup — 10 menit window
    // agar tidak harus menyimpan ttl per key.
    // Method ini dipanggil dari setInterval, jadi "now" harus up-to-date.
    // Karena kita tidak tahu windowMs per key, prune entry yang sangat tua
    // (timestamp < now - MAX_REASONABLE_WINDOW). Kita hardcode 10 menit.
    const maxAge = 10 * 60_000 // 10 menit
    const cutoff = now - maxAge

    for (const [key, timestamps] of this.hits) {
      const active = timestamps.filter((t) => t > cutoff)
      if (active.length === 0) {
        this.hits.delete(key)
      } else {
        this.hits.set(key, active)
      }
    }
  }

  destroy(): void {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}