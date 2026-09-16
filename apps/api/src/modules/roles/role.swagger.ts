import { RoleSchema, CreateRoleSchema, UpdateRoleSchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Roles
 * ============================================================
 *
 * Item roles memakai zodToOpenApi dari schema validator (SSOT).
 * Pagination memakai helper generik @packages/documentation.
 */

export const roleSchema = zodToOpenApi(RoleSchema)
export const createRoleSchema = zodToOpenApi(CreateRoleSchema)
export const updateRoleSchema = zodToOpenApi(UpdateRoleSchema)
export const paginatedRoleSchema = paginatedOpenApiResponse(roleSchema)