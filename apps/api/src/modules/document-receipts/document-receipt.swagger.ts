import {
  DocumentReceiptSchema,
  CreateDocumentReceiptSchema,
  UpdateDocumentReceiptSchema,
} from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk DocumentReceipts
 * ============================================================
 */

export const documentReceiptSchema = zodToOpenApi(DocumentReceiptSchema)
export const createDocumentReceiptSchema = zodToOpenApi(CreateDocumentReceiptSchema)
export const updateDocumentReceiptSchema = zodToOpenApi(UpdateDocumentReceiptSchema)
export const paginatedDocumentReceiptSchema = paginatedOpenApiResponse(documentReceiptSchema)
