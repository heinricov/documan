import { pino, type LoggerOptions } from "pino"
import { envDefaults } from "@configs/environment"
import { getLogContext } from "./context.js"
import { serializeError } from "./serializer.js"

/**
 * ============================================================
 *  Logger Types
 * ============================================================
 */

export interface CreateLoggerOptions {
  /** Nama service — ditambahkan ke semua log (contoh: "api", "web") */
  service?: string
  /** Level minimum yang ditampilkan (trace/debug/info/warn/error/fatal) */
  level?: string
  /**
   * Pretty output untuk development (colored, readable).
   * Default: true jika NODE_ENV bukan "production".
   */
  pretty?: boolean
  /** Context tambahan yang selalu disertakan di semua log */
  baseContext?: Record<string, unknown>
  /**
   * Daftar properti yang di-redact (disensor) saat log.
   * Default: path sensitif umum (password, token, authorization, cookie, dll).
   * Format mengikuti pino redact (mis. "*.password", "authorization").
   */
  redact?: string[]
}

/**
 * Path default yang disensor agar secret tidak bocor ke log.
 */
const DEFAULT_REDACT: string[] = [
  "*.password",
  "*.secret",
  "*.token",
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "apiKey",
  "JWT_SECRET",
  "DATABASE_URL",
]

/**
 * ============================================================
 *  Logger Factory
 * ============================================================
 */

/**
 * Buat logger instance (pino).
 *
 * @example
 * ```ts
 * const log = createLogger({ service: "api" })
 * log.info("Server started")
 * log.error({ err: new Error("boom") }, "Request failed")
 * ```
 */
export function createLogger(options: CreateLoggerOptions = {}) {
  const {
    service,
    level = process.env.LOG_LEVEL ?? envDefaults.LOG_LEVEL,
    pretty,
    baseContext,
    redact = DEFAULT_REDACT,
  } = options

  const isPretty = pretty ?? process.env.NODE_ENV !== "production"

  const loggerOptions: LoggerOptions = {
    level,
    base: baseContext ?? {},
    timestamp: pino.stdTimeFunctions.isoTime,
    redact,
  }

  // Set service di base jika disediakan
  if (service) {
    loggerOptions.base = { ...loggerOptions.base, service }
  }

  // Set pino-pretty transport untuk development
  if (isPretty) {
    loggerOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: true,
        ignore: "pid,hostname,service,requestId",
      },
    }
  }

  // Auto-attach context dari AsyncLocalStorage ke semua log
  loggerOptions.mixin = () => ({ ...getLogContext() })

  return pino(loggerOptions)
}

/**
 * ============================================================
 *  Default Instance
 * ============================================================
 */

/**
 * Default logger instance (service: "documan").
 * Untuk penggunaan langsung tanpa konfigurasi.
 */
export const logger = createLogger()

/**
 * Type dari Logger instance (pino).
 */
export type Logger = ReturnType<typeof createLogger>

export { serializeError }