/**
 * ============================================================
 *  Rate Limit Store (pluggable)
 * ============================================================
 *
 * RateLimitGuard tidak lagi menyimpan hit di dalam dirinya sendiri,
 * melainkan lewat interface `RateLimitStore`. Implementasi default
 * adalah InMemoryRateLimitStore (untuk 1 instance).
 *
 * Untuk multi-instance (load-balanced), implementasikan store dengan
 * store bersama (mis. Redis) dan daftarkan via DI:
 *
 * ```ts
 * {
 *   provide: RATE_LIMIT_STORE,
 *   useClass: RedisRateLimitStore,
 * }
 * ```
 */

/** DI token untuk RateLimitStore */
export const RATE_LIMIT_STORE = Symbol("RATE_LIMIT_STORE")

export interface RateLimitHit {
  /** true = request diizinkan, false = kena batas */
  allowed: boolean
  /** Waktu tunggu (ms) sebelum boleh request lagi (jika !allowed) */
  retryAfterMs?: number
}

export interface RateLimitStore {
  /**
   * Periksa & catat satu request untuk key tertentu.
   *
   * @param key      identitas request (mis. IP)
   * @param windowMs panjang jendela (ms)
   * @param max      jumlah request maksimal per window
   */
  check(key: string, windowMs: number, max: number): RateLimitHit

  /** Bersihkan data lama — dipanggil guard secara berkala (opsional) */
  prune?(now: number): void
}