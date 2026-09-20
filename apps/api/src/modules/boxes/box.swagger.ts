import { BoxSchema, CreateBoxSchema, UpdateBoxSchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Boxes
 * ============================================================
 */

export const boxSchema = zodToOpenApi(BoxSchema)
export const createBoxSchema = zodToOpenApi(CreateBoxSchema)
export const updateBoxSchema = zodToOpenApi(UpdateBoxSchema)
export const paginatedBoxSchema = paginatedOpenApiResponse(boxSchema)
