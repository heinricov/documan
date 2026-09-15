/**
 * @packages/logger
 *
 * Structured logging (pino) untuk semua layer (api, web, packages).
 * Otomatis membawa request context (requestId, userId, dll).
 */

// ====================== Logger ======================
export { createLogger, logger } from "./logger.js"
export type { Logger, CreateLoggerOptions } from "./logger.js"

// ====================== Context ======================
export {
  withLogContext,
  getLogContext,
  setLogContext,
  buildHttpContext,
  generateRequestId,
} from "./context.js"
export type { LogContext } from "./context.js"

// ====================== Serializers ======================
export {
  serializeError,
  serializeResponse,
  createTimer,
} from "./serializer.js"
export type { SerializedError } from "./serializer.js"