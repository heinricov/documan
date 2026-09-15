/**
 * ============================================================
 *  Error Serializer — untuk logs yang readable
 * ============================================================
 */

interface SerializedError {
  type: string
  message: string
  code?: string
  stack?: string
  status?: number
  details?: unknown
}

export type { SerializedError }

/**
 * Convert error ke object yang aman & readable untuk logs.
 * Menghindari stack trace yang terlalu besar di development.
 *
 * @example
 * ```ts
 * logger.error({ err: serializeError(error) }, "Request failed")
 * ```
 */
export function serializeError(error: unknown, opts: { stack?: boolean } = {}): SerializedError {
  if (!error || typeof error !== "object") {
    return {
      type: "Unknown",
      message: String(error),
    }
  }

  const err = error as Record<string, unknown>
  const showStack = opts.stack ?? process.env.NODE_ENV !== "production"

  const serialized: SerializedError = {
    type: err.name === null ? "Error" : String(err.name ?? "Error"),
    message: err.message ? String(err.message) : String(error),
  }

  if (typeof err.code === "string") {
    serialized.code = err.code
  }

  if (typeof err.status === "number") {
    serialized.status = err.status
  }

  if (err.details !== undefined) {
    serialized.details = err.details
  }

  if (showStack && typeof err.stack === "string") {
    serialized.stack = err.stack
  }

  return serialized
}

/**
 * Serializer untuk response info.
 *
 * @example
 * ```ts
 * logger.info(serializeResponse(200, 45), "Request completed")
 * // → { statusCode: 200, durationMs: 45 }
 * ```
 */
export function serializeResponse(
  statusCode: number,
  durationMs: number
): Record<string, unknown> {
  return {
    statusCode,
    durationMs: Math.round(durationMs),
  }
}

/**
 * Helper untuk mengukur durasi request.
 * Bisa dipakai di middleware/guard.
 *
 * @example
 * ```ts
 * const stop = createTimer()
 * // ... proses request
 * logger.info(serializeResponse(status, stop()), "Request handled")
 * ```
 */
export function createTimer(): () => number {
  const start = performance.now()
  return () => performance.now() - start
}