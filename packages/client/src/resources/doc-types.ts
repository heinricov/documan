import { z } from "zod"
import type { Http } from "../http"
import {
  CreateDocTypeSchema,
  DocTypeSchema,
  DocTypeQuerySchema,
  UpdateDocTypeSchema,
  type CreateDocType,
  type DocType,
  type UpdateDocType,
} from "@packages/validator"

export interface DocTypesResource {
  list(query?: z.input<typeof DocTypeQuerySchema>): Promise<DocType[]>
  get(id: string): Promise<DocType>
  create(data: CreateDocType): Promise<DocType>
  update(id: string, data: UpdateDocType): Promise<DocType>
  remove(id: string): Promise<DocType>
}

export function createDocTypesResource(http: Http): DocTypesResource {
  const path = "/doc-types"

  return {
    list(query) {
      const parsed = DocTypeQuerySchema.parse(query ?? {})

      return http.request(z.array(DocTypeSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(DocTypeSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateDocTypeSchema.parse(data)

      return http.request(DocTypeSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateDocTypeSchema.parse(data)

      return http.request(DocTypeSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      return http.request(DocTypeSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}