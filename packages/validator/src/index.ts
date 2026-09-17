/**
 * @packages/validator
 *
 * Shared validation schemas and types for the monorepo.
 * Single source of truth untuk validasi & type antara web ↔ api.
 */

// ====================== Common ======================
export {
  IdParamsSchema,
  PaginationMetaSchema,
  paginatedResponseSchema,
} from "@packages/validator/schemas/common"

export type {
  IdParams,
  PaginationMeta,
  PaginatedResponseSchema,
} from "@packages/validator/schemas/common"

// ====================== Schemas ======================
export {
  RoleSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleQuerySchema,
} from "@packages/validator/schemas/role"

// ====================== Types ======================
export type {
  Role,
  CreateRole,
  UpdateRole,
  RoleQuery,
} from "@packages/validator/schemas/role"
