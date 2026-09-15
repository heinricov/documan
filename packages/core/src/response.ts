import { ErrorCode, ErrorStatus } from "./errors.js"
import type { PaginationMeta } from "./pagination.js"

/**
 * ============================================================
 *  Success Response Types
 * ============================================================
 */

/**
 * Standard success response — digunakan untuk single item
 */
export interface SuccessResponse<T> {
  success: true
  data: T
}

/**
 * Paginated success response — digunakan untuk list/Collection
 */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

/**
 * ============================================================
 *  Error Response Types
 * ============================================================
 */

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}

/**
 * ============================================================
 *  Union type — semua kemungkinan response
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
export type ApiPaginatedResponse<T> =
  | PaginatedResponse<T>
  | ErrorResponse

/**
 * ============================================================
 *  Response Helpers
 * ============================================================
 */

/**
 * Buat success response untuk single item
 *
 * @example
 * ```ts
 * return successResponse({ id: "1", title: "Admin" })
 * // → { success: true, data: { id: "1", title: "Admin" } }
 * ```
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data }
}

/**
 * Buat paginated response
 *
 * @example
 * ```ts
 * const roles = await prisma.role.findMany({ skip: 0, take: 10 })
 * const total = await prisma.role.count()
 *
 * return paginatedResponse(roles, { page: 1, limit: 10, total })
 * // → { success: true, data: [...], meta: { page: 1, limit: 10, total: 50, totalPages: 5, ... } }
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  params: { page: number; limit: number; total: number }
): PaginatedResponse<T> {
  const { page, limit, total } = params
  const totalPages = Math.ceil(total / limit)

  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  }
}

/**
 * Buat error response
 *
 * @example
 * ```ts
 * return errorResponse(ErrorCode.NOT_FOUND, "Role not found")
 * // → { success: false, error: { code: "NOT_FOUND", message: "Role not found" } }
 * ```
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}

/**
 * Buat error response dari HTTP status code
 *
 * @example
 * ```ts
 * return errorResponseFromStatus(404, "Role not found")
 * // → { success: false, error: { code: "NOT_FOUND", message: "Role not found" } }
 * ```
 */
export function errorResponseFromStatus(
  status: number,
  message: string,
  details?: unknown
): ErrorResponse {
  const code = (Object.entries(ErrorStatus) as [ErrorCode, number][]).find(
    ([, s]) => s === status
  )?.[0] ?? ErrorCode.INTERNAL_ERROR

  return errorResponse(code, message, details)
}