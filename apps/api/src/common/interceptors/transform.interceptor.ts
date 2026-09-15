import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable, map, tap } from "rxjs"
import { successResponse } from "@packages/core"
import {
  createLogger,
  createTimer,
  serializeError,
  serializeResponse,
} from "@packages/logger"

const logger = createLogger({ service: "api" })

/**
 * ============================================================
 *  Transform Interceptor
 * ============================================================
 *
 * Membungkus SEMUA response sukses ke format @packages/core:
 *   { success: true, data }
 *
 * Nilai yang sudah punya properti `success` (mis. dari helper
 * `successResponse`/`paginatedResponse`) dibiarkan apa adanya.
 * Otomatis menulis log durasi + status untuk tiap request.
 */

function isApiResponse(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value
  )
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    const stop = createTimer()

    return next.handle().pipe(
      map((data: unknown) =>
        isApiResponse(data) ? data : successResponse(data)
      ),
      tap({
        next: () => {
          const status =
            context.switchToHttp().getResponse().statusCode ?? 200
          logger.info(serializeResponse(status, stop()), "Request handled")
        },
        error: (err: unknown) => {
          logger.error(
            { err: serializeError(err) },
            "Request failed"
          )
        },
      })
    )
  }
}