import { RoleSchema, CreateRoleSchema, UpdateRoleSchema } from "@packages/validator"
import { zodToOpenApi, type OpenApiSchema } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Roles
 * ============================================================
 *
 * Item roles memakai zodToOpenApi dari schema validator (SSOT).
 * Pagination dideklarasikan inline karena belum ada schema pagination.
 */

export const roleSchema = zodToOpenApi(RoleSchema)
export const createRoleSchema = zodToOpenApi(CreateRoleSchema)
export const updateRoleSchema = zodToOpenApi(UpdateRoleSchema)

export const paginatedRoleSchema: OpenApiSchema = {
  type: "object",
  required: ["success", "data", "meta"],
  properties: {
    success: { type: "boolean" },
    data: { type: "array", items: roleSchema },
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