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

// ====================== User Schemas ======================
export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
} from "@packages/validator/schemas/user"

// ====================== User Types ======================
export type {
  User,
  CreateUser,
  UpdateUser,
  UserQuery,
} from "@packages/validator/schemas/user"

// ====================== Subsidiary Schemas ======================
export {
  SubsidiarySchema,
  CreateSubsidiarySchema,
  UpdateSubsidiarySchema,
  SubsidiaryQuerySchema,
} from "@packages/validator/schemas/subsidiary"

// ====================== Subsidiary Types ======================
export type {
  Subsidiary,
  CreateSubsidiary,
  UpdateSubsidiary,
  SubsidiaryQuery,
} from "@packages/validator/schemas/subsidiary"

// ====================== Auth Schemas ======================
export {
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
} from "@packages/validator/schemas/auth"

// ====================== Auth Types ======================
export type {
  LoginBody,
  RegisterBody,
  AuthResponse,
} from "@packages/validator/schemas/auth"
