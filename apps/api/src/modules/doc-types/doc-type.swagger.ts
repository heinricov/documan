import { DocTypeSchema, CreateDocTypeSchema, UpdateDocTypeSchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk DocTypes
 * ============================================================
 */

export const docTypeSchema = zodToOpenApi(DocTypeSchema)
export const createDocTypeSchema = zodToOpenApi(CreateDocTypeSchema)
export const updateDocTypeSchema = zodToOpenApi(UpdateDocTypeSchema)
export const paginatedDocTypeSchema = paginatedOpenApiResponse(docTypeSchema)