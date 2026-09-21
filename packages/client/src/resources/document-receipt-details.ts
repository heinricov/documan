import { z } from "zod"
import type { Http } from "../http"
import {
  DocumentReceiptDetailSchema,
  CreateDocumentReceiptDetailSchema,
  DocumentReceiptDetailQuerySchema,
  UpdateDocumentReceiptDetailSchema,
  type DocumentReceiptDetail,
  type CreateDocumentReceiptDetail,
  type UpdateDocumentReceiptDetail,
} from "@packages/validator"

export interface DocumentReceiptDetailsResource {
  list(query?: z.input<typeof DocumentReceiptDetailQuerySchema>): Promise<DocumentReceiptDetail[]>
  get(id: string): Promise<DocumentReceiptDetail>
  create(data: CreateDocumentReceiptDetail): Promise<DocumentReceiptDetail>
  update(id: string, data: UpdateDocumentReceiptDetail): Promise<DocumentReceiptDetail>
  remove(id: string): Promise<DocumentReceiptDetail>
}

export function createDocumentReceiptDetailsResource(http: Http): DocumentReceiptDetailsResource {
  const path = "/document-receipt-details"

  return {
    list(query) {
      const parsed = DocumentReceiptDetailQuerySchema.parse(query ?? {})

      return http.request(z.array(DocumentReceiptDetailSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(DocumentReceiptDetailSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateDocumentReceiptDetailSchema.parse(data)

      return http.request(DocumentReceiptDetailSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateDocumentReceiptDetailSchema.parse(data)

      return http.request(DocumentReceiptDetailSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      return http.request(DocumentReceiptDetailSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}
