import { AsyncLocalStorage } from "node:async_hooks"
import { randomUUID } from "node:crypto"

/**
 * ============================================================
 *  Request Context Types
 * ============================================================
 */

export interface LogContext {
  /** Unique request ID — untuk trace log dari satu request */
  requestId?: string
  /** Authenticated user ID — jika tersedia */
  userId?: string
  /** HTTP method dari request */
  method?: string
  /** Path dari request */
  path?: string
  /** Service/module name (contoh: "api", "web", "db") */
  service?: string
  /** Environment (development, production, test) */
  env?: string
}

type LogContextValue = LogContext | undefined

/**
 * ============================================================
 *  AsyncLocalStorage — Thread-safe request context
 * ============================================================
 *
 * AsyncLocalStorage memastikan setiap request punya context masing-masing.
 * Aman untuk concurrent requests karena context ter-isolasi per async flow.
 */
const storage = new AsyncLocalStorage<LogContextValue>()

/**
 * Mulai context baru untuk sebuah request.
 * Semua log di dalam callback akan membawa context ini.
 *
 * @example
 * ```ts
 * await withLogContext({ requestId, userId, method, path }, async () => {
 *   // Semua log di sini punya requestId, userId, dll
 *   logger.info("Fetched roles")
 * })
 * ```
 */
export async function withLogContext<T>(
  context: LogContext,
  fn: () => Promise<T> | T
): Promise<T> {
  return storage.run(context, () => Promise.resolve(fn()))
}

/**
 * Get context yang sedang aktif (request context).
 * Mengembalikan context dari log context yang sudah masuk LEBIH DAHULU.
 *
 * Catatan: Context hanya tersedia di dalam `withLogContext`.
 * Jika dipanggil di luar, akan mengembalikan undefined.
 */
export function getLogContext(): Readonly<LogContext> {
  const existing = storage.getStore()
  const inherited = { ...getInheritedContext() }

  return { ...inherited, ...existing }
}

/**
 * Tambah/update field pada context aktif (tidak return baru).
 *
 * @example
 * ```ts
 * await withLogContext({ requestId }, async () => {
 *   setLogContext({ userId: user.id }) // tambahkan userId
 *   logger.info("User authenticated")
 * })
 * ```
 */
export function setLogContext(partial: LogContext): void {
  const current = storage.getStore() ?? {}
  storage.enterWith({ ...current, ...partial })
}

/**
 * Generate request ID baru (UUID v4).
 * Pakai untuk membuat requestId di awal middleware.
 */
export function generateRequestId(): string {
  return randomUUID()
}

/**
 * Helper untuk membangun context dari HTTP request standar.
 * Bisa dipakai di NestJS guard/middleware maupun Next.js middleware.
 *
 * @example
 * ```ts
 * const context = buildHttpContext(req)
 * // → { requestId: "uuid", method: "GET", path: "/roles" }
 * ```
 */
export function buildHttpContext(
  req: { method?: unknown; url?: unknown; headers?: Record<string, unknown> }
): LogContext {
  const requestId =
    (req.headers?.["x-request-id"] as string | undefined) ??
    generateRequestId()

  return {
    requestId,
    method: typeof req.method === "string" ? req.method : undefined,
    path: typeof req.url === "string" ? req.url : undefined,
  }
}

/**
 * Internal: gabungkan context yang lebih tinggi cakupannya.
 * Memungkinkan service-level context (misal logger default) diteruskan.
 */
function getInheritedContext(): LogContext {
  return {}
}