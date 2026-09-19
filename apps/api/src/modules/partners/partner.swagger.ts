import { PartnerSchema, CreatePartnerSchema, UpdatePartnerSchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Partners
 * ============================================================
 */

export const partnerSchema = zodToOpenApi(PartnerSchema)
export const createPartnerSchema = zodToOpenApi(CreatePartnerSchema)
export const updatePartnerSchema = zodToOpenApi(UpdatePartnerSchema)
export const paginatedPartnerSchema = paginatedOpenApiResponse(partnerSchema)