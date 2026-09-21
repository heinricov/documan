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
  AuthResponseSchema,
} from "@packages/validator/schemas/auth"

// ====================== Auth Types ======================
export type {
  LoginBody,
  AuthResponse,
} from "@packages/validator/schemas/auth"

// ====================== DocType Schemas ======================
export {
  DocTypeSchema,
  CreateDocTypeSchema,
  UpdateDocTypeSchema,
  DocTypeQuerySchema,
} from "@packages/validator/schemas/doc-type"

// ====================== DocType Types ======================
export type {
  DocType,
  CreateDocType,
  UpdateDocType,
  DocTypeQuery,
} from "@packages/validator/schemas/doc-type"

// ====================== Partner Schemas ======================
export {
  PartnerSchema,
  CreatePartnerSchema,
  UpdatePartnerSchema,
  PartnerQuerySchema,
} from "@packages/validator/schemas/partner"

// ====================== Partner Types ======================
export type {
  Partner,
  CreatePartner,
  UpdatePartner,
  PartnerQuery,
} from "@packages/validator/schemas/partner"

// ====================== Box Schemas ======================
export {
  BoxSchema,
  CreateBoxSchema,
  UpdateBoxSchema,
  BoxQuerySchema,
} from "@packages/validator/schemas/box"

// ====================== Box Types ======================
export type {
  Box,
  CreateBox,
  UpdateBox,
  BoxQuery,
} from "@packages/validator/schemas/box"

// ====================== DocumentReceipt Schemas ======================
export {
  DocumentReceiptSchema,
  CreateDocumentReceiptSchema,
  UpdateDocumentReceiptSchema,
  DocumentReceiptQuerySchema,
} from "@packages/validator/schemas/document-receipt"

// ====================== DocumentReceipt Types ======================
export type {
  DocumentReceipt,
  CreateDocumentReceipt,
  UpdateDocumentReceipt,
  DocumentReceiptQuery,
} from "@packages/validator/schemas/document-receipt"

// ====================== DocumentReceiptDetail Schemas ======================
export {
  DocumentReceiptDetailSchema,
  CreateDocumentReceiptDetailSchema,
  UpdateDocumentReceiptDetailSchema,
  DocumentReceiptDetailQuerySchema,
} from "@packages/validator/schemas/document-receipt-detail"

// ====================== DocumentReceiptDetail Types ======================
export type {
  DocumentReceiptDetail,
  CreateDocumentReceiptDetail,
  UpdateDocumentReceiptDetail,
  DocumentReceiptDetailQuery,
} from "@packages/validator/schemas/document-receipt-detail"
