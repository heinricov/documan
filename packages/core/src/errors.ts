/**
 * Standardized error codes untuk API responses
 */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

/**
 * HTTP status codes yang sesuai dengan ErrorCode
 */
export const ErrorStatus: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
}

/**
 * Base error class untuk semua application errors.
 * Semua error harus extend class ini.
 */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = ErrorStatus[code]
    this.details = details
  }
}

/**
 * 400 — Request tidak valid (validation error)
 */
export class ValidationError extends AppError {
  readonly fieldErrors?: Record<string, string[]>

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(ErrorCode.VALIDATION_ERROR, message)
    this.name = "ValidationError"
    this.fieldErrors = fieldErrors
  }
}

/**
 * 401 — Belum login / token tidak valid
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(ErrorCode.UNAUTHORIZED, message)
    this.name = "UnauthorizedError"
  }
}

/**
 * 403 — Sudah login tapi tidak punya akses
 */
export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(ErrorCode.FORBIDDEN, message)
    this.name = "ForbiddenError"
  }
}

/**
 * 404 — Resource tidak ditemukan
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`
    super(ErrorCode.NOT_FOUND, message)
    this.name = "NotFoundError"
  }
}

/**
 * 409 — Conflict (data sudah ada, double submit, dll)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.CONFLICT, message, details)
    this.name = "ConflictError"
  }
}

/**
 * 429 — Rate limit terlalu banyak request
 */
export class RateLimitError extends AppError {
  readonly retryAfter?: number

  constructor(retryAfter?: number) {
    super(ErrorCode.RATE_LIMITED, "Too many requests")
    this.name = "RateLimitError"
    this.retryAfter = retryAfter
  }
}

/**
 * 500 — Internal server error
 */
export class InternalError extends AppError {
  constructor(message = "Internal server error", details?: unknown) {
    super(ErrorCode.INTERNAL_ERROR, message, details)
    this.name = "InternalError"
  }
}