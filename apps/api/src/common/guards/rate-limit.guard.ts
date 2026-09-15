import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { RateLimitError } from "@packages/core"

/**
 * ============================================================
 *  Sliding Window Rate Limiter
 * ============================================================
 *
 * Guard global in-memory (per instance) untuk mencegah banjir request.
 * Keyed by IP. Melempar RateLimitError dari @packages/core
 * sehingga filter global mengubahnya jadi format standar (RATE_LIMITED, 429).
 *
 * Konfigurasi via env:
 *   RATE_LIMIT_TTL_MS — default 60000 (1 menit)
 *   RATE_LIMIT_MAX    — default 100 request per window
 *
 * Catatan: in-memory → tidak shared antar instance. Untuk multi-instance,
 * ganti ke store terdistribusi (mis. Redis) nanti.
 */

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs: number
  private readonly max: number
  private readonly hits = new Map<string, number[]>()

  constructor() {
    this.windowMs = Number(process.env.RATE_LIMIT_TTL_MS) || 60_000
    this.max = Number(process.env.RATE_LIMIT_MAX) || 100

    // Bersihkan entry yang sudah kadaluarsa secara berkala
    const interval = setInterval(() => this.prune(), this.windowMs)
    interval.unref()
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const key = (request.ip as string | undefined) ?? "unknown"

    const now = Date.now()
    const cutoff = now - this.windowMs
    const timestamps = (this.hits.get(key) ?? []).filter(
      (t) => t > cutoff
    )

    if (timestamps.length >= this.max) {
      const oldest = timestamps[0]!
      const retryAfter = Math.ceil((oldest + this.windowMs - now) / 1000)
      throw new RateLimitError(retryAfter)
    }

    timestamps.push(now)
    this.hits.set(key, timestamps)

    return true
  }

  private prune(): void {
    const cutoff = Date.now() - this.windowMs
    for (const [key, timestamps] of this.hits) {
      const active = timestamps.filter((t) => t > cutoff)
      if (active.length === 0) {
        this.hits.delete(key)
      } else {
        this.hits.set(key, active)
      }
    }
  }
}