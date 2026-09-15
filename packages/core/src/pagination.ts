import { ValidationError } from "./errors.js"

/**
 * ============================================================
 *  Pagination Parameters
 * ============================================================
 */

/**
 * Offset-based pagination parameters
 * Digunakan untuk query sederhana (page/limit)
 */
export interface OffsetPaginationParams {
  page?: number
  limit?: number
}

/**
 * Cursor-based pagination parameters
 * Digunakan untuk infinite scroll / large datasets
 */
export interface CursorPaginationParams {
  cursor?: string
  limit?: number
}

/**
 * Parsed & normalized pagination params (offset-based)
 */
export interface ParsedPagination {
  page: number
  limit: number
  offset: number
}

/**
 * Parsed & normalized pagination params (cursor-based)
 */
export interface ParsedCursorPagination {
  cursor: string | null
  limit: number
}

/**
 * Pagination metadata untuk response
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Cursor pagination metadata untuk response
 */
export interface CursorPaginationMeta {
  nextCursor: string | null
  previousCursor: string | null
  limit: number
  hasMore: boolean
}

/**
 * ============================================================
 *  Default Values
 * ============================================================
 */

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

/**
 * ============================================================
 *  Offset-based Pagination Helpers
 * ============================================================
 */

/**
 * Parse dan validasi pagination parameters (offset-based)
 *
 * @example
 * ```ts
 * const { page, limit, offset } = parseOffsetPagination({ page: 2, limit: 20 })
 * // → { page: 2, limit: 20, offset: 20 }
 * ```
 */
export function parseOffsetPagination(
  params: OffsetPaginationParams = {}
): ParsedPagination {
  const page = Math.max(1, Math.floor(Number(params.page) || DEFAULT_PAGE))
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(params.limit) || DEFAULT_LIMIT))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Hitung pagination metadata dari total items
 *
 * @example
 * ```ts
 * const meta = calculatePaginationMeta({ page: 1, limit: 10, total: 55 })
 * // → { page: 1, limit: 10, total: 55, totalPages: 6, hasNext: true, hasPrevious: false }
 * ```
 */
export function calculatePaginationMeta(params: {
  page: number
  limit: number
  total: number
}): PaginationMeta {
  const { page, limit, total } = params
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

/**
 * ============================================================
 *  Cursor-based Pagination Helpers
 * ============================================================
 */

/**
 * Parse cursor parameters
 * Cursor di-encode sebagai Base64 JSON
 *
 * @example
 * ```ts
 * const parsed = parseCursorPagination({ cursor: "eyJpZCI6IjEifQ==", limit: 20 })
 * // → { cursor: '{"id":"1"}', limit: 20 }
 * ```
 */
export function parseCursorPagination(
  params: CursorPaginationParams = {}
): ParsedCursorPagination {
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(params.limit) || DEFAULT_LIMIT))
  )

  let cursor: string | null = null

  if (params.cursor) {
    try {
      cursor = Buffer.from(params.cursor, "base64").toString("utf-8")
    } catch {
      throw new ValidationError("Invalid cursor format")
    }
  }

  return { cursor, limit }
}

/**
 * Encode cursor dari data
 *
 * @example
 * ```ts
 * const cursor = encodeCursor({ id: "abc-123" })
 * // → "eyJpZCI6ImFiYy0xMjMifQ=="
 * ```
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64")
}

/**
 * Decode cursor ke data
 *
 * @example
 * ```ts
 * const data = decodeCursor("eyJpZCI6ImFiYy0xMjMifQ==")
 * // → { id: "abc-123" }
 * ```
 */
export function decodeCursor(cursor: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"))
  } catch {
    throw new ValidationError("Invalid cursor format")
  }
}

/**
 * ============================================================
 *  Prisma Query Helpers
 * ============================================================
 */

/**
 * Build Prisma query args dari parsed pagination
 *
 * @example
 * ```ts
 * const pagination = parseOffsetPagination({ page: 2, limit: 10 })
 * const args = toPrismaArgs(pagination)
 * // → { skip: 10, take: 10 }
 * ```
 */
export function toPrismaArgs(pagination: ParsedPagination): {
  skip: number
  take: number
} {
  return {
    skip: pagination.offset,
    take: pagination.limit,
  }
}