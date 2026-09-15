/**
 * @packages/core
 *
 * Shared types, response format, dan utilities untuk semua layer.
 * Single source of truth untuk kontrak antara api ↔ web.
 */

// ====================== Errors ======================
export {
  ErrorCode,
  ErrorStatus,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
} from "./errors.js"

export type { ErrorCode as ErrorCodeType } from "./errors.js"

// ====================== Response ======================
export {
  successResponse,
  paginatedResponse,
  errorResponse,
  errorResponseFromStatus,
} from "./response.js"

export type {
  SuccessResponse,
  PaginatedResponse,
  ErrorResponse,
  ApiResponse,
  ApiPaginatedResponse,
} from "./response.js"

// ====================== Pagination ======================
export {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parseOffsetPagination,
  calculatePaginationMeta,
  parseCursorPagination,
  encodeCursor,
  decodeCursor,
  toPrismaArgs,
} from "./pagination.js"

export type {
  PaginationMeta,
  OffsetPaginationParams,
  CursorPaginationParams,
  ParsedPagination,
  ParsedCursorPagination,
  CursorPaginationMeta,
} from "./pagination.js"