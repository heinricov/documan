import { z } from "zod"
import type { Http } from "../http"
import {
  DocumentReceiptSchema,
  CreateDocumentReceiptSchema,
  DocumentReceiptQuerySchema,
  UpdateDocumentReceiptSchema,
  type DocumentReceipt,
  type CreateDocumentReceipt,
  type UpdateDocumentReceipt,
} from "@packages/validator"

export interface DocumentReceiptsResource {
  list(query?: z.input<typeof DocumentReceiptQuerySchema>): Promise<DocumentReceipt[]>
  get(id: string): Promise<DocumentReceipt>
  create(data: CreateDocumentReceipt): Promise<DocumentReceipt>
  update(id: string, data: UpdateDocumentReceipt): Promise<DocumentReceipt>
  remove(id: string): Promise<DocumentReceipt>
}

export function createDocumentReceiptsResource(http: Http): DocumentReceiptsResource {
  const path = "/document-receipts"

  return {
    list(query) {
      const parsed = DocumentReceiptQuerySchema.parse(query ?? {})

      return http.request(z.array(DocumentReceiptSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(DocumentReceiptSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateDocumentReceiptSchema.parse(data)

      return http.request(DocumentReceiptSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateDocumentReceiptSchema.parse(data)

      return http.request(DocumentReceiptSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      return http.request(DocumentReceiptSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}
