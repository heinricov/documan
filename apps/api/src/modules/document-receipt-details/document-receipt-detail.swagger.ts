import {
  DocumentReceiptDetailSchema,
  CreateDocumentReceiptDetailSchema,
  UpdateDocumentReceiptDetailSchema,
} from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk DocumentReceiptDetails
 * ============================================================
 */

export const documentReceiptDetailSchema = zodToOpenApi(DocumentReceiptDetailSchema)
export const createDocumentReceiptDetailSchema = zodToOpenApi(CreateDocumentReceiptDetailSchema)
export const updateDocumentReceiptDetailSchema = zodToOpenApi(UpdateDocumentReceiptDetailSchema)
export const paginatedDocumentReceiptDetailSchema = paginatedOpenApiResponse(documentReceiptDetailSchema)
