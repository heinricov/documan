import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common"
import { RateLimitError } from "@packages/core"
import { envDefaults } from "@configs/environment"
import { RATE_LIMIT_STORE, type RateLimitStore } from "../rate-limit/store.js"

/**
 * ============================================================
 *  Sliding Window Rate Limiter (pluggable)
 * ============================================================
 *
 * Guard global untuk mencegah banjir request. Keyed by IP.
 * Menggunakan `RateLimitStore` (injected via DI) sehingga
 * implementasi store bisa diganti dari in-memory ke Redis
 * tanpa mengubah guard.
 *
 * Default: InMemoryRateLimitStore (per-1-instance).
 * Untuk multi-instance, ganti store via DI di AppModule.
 *
 * Konfigurasi via env:
 *   RATE_LIMIT_TTL_MS — default 60000 (1 menit)
 *   RATE_LIMIT_MAX    — default 100 request per window
 */

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs: number
  private readonly max: number

  constructor(
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore
  ) {
    this.windowMs = Number(process.env.RATE_LIMIT_TTL_MS) || envDefaults.RATE_LIMIT_TTL_MS
    this.max = Number(process.env.RATE_LIMIT_MAX) || envDefaults.RATE_LIMIT_MAX
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const key = (request.ip as string | undefined) ?? "unknown"

    const result = this.store.check(key, this.windowMs, this.max)

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.retryAfterMs ?? 1000) / 1000)
      throw new RateLimitError(retryAfter)
    }

    return true
  }
}