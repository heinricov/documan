import type { OpenApiSchema } from "./zod-openapi.js"

/**
 * ============================================================
 *  Pagination → OpenAPI
 * ============================================================
 *
 * Bangun OpenAPI schema untuk respons terpaginasi:
 * `{ success, data: [item], meta { page, limit, total, ... } }`.
 * Dipakai sebagai `schema` pada @ApiOkResponse dari endpoint list.
 *
 * @example
 * ```ts
 * const paginatedRoles = paginatedOpenApiResponse(zodToOpenApi(RoleSchema))
 * ```
 */
export function paginatedOpenApiResponse(
  itemSchema: OpenApiSchema
): OpenApiSchema {
  return {
    type: "object",
    required: ["success", "data", "meta"],
    properties: {
      success: { type: "boolean" },
      data: { type: "array", items: itemSchema },
      meta: {
        type: "object",
        required: ["page", "limit", "total", "totalPages", "hasNext", "hasPrevious"],
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          hasNext: { type: "boolean" },
          hasPrevious: { type: "boolean" },
        },
      },
    },
  }
}