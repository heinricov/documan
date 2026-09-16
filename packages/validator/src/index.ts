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
} from "./schemas/common.js"

export type {
  IdParams,
  PaginationMeta,
  PaginatedResponseSchema,
} from "./schemas/common.js"

// ====================== Schemas ======================
export {
  RoleSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleQuerySchema,
} from "./schemas/role.js"

// ====================== Types ======================
export type {
  Role,
  CreateRole,
  UpdateRole,
  RoleQuery,
} from "./schemas/role.js"
