import { SubsidiarySchema, CreateSubsidiarySchema, UpdateSubsidiarySchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Subsidiaries
 * ============================================================
 *
 * Item subsidiaries memakai zodToOpenApi dari schema validator (SSOT).
 * Pagination memakai helper generik @packages/documentation.
 */

export const subsidiarySchema = zodToOpenApi(SubsidiarySchema)
export const createSubsidiarySchema = zodToOpenApi(CreateSubsidiarySchema)
export const updateSubsidiarySchema = zodToOpenApi(UpdateSubsidiarySchema)
export const paginatedSubsidiarySchema = paginatedOpenApiResponse(subsidiarySchema)