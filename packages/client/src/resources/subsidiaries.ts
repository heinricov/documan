import { z } from "zod"
import type { Http } from "../http"
import {
  CreateSubsidiarySchema,
  SubsidiarySchema,
  SubsidiaryQuerySchema,
  UpdateSubsidiarySchema,
  type CreateSubsidiary,
  type Subsidiary,
  type UpdateSubsidiary,
} from "@packages/validator"

export interface SubsidiariesResource {
  list(query?: z.input<typeof SubsidiaryQuerySchema>): Promise<Subsidiary[]>
  get(id: string): Promise<Subsidiary>
  create(data: CreateSubsidiary): Promise<Subsidiary>
  update(id: string, data: UpdateSubsidiary): Promise<Subsidiary>
  remove(id: string): Promise<Subsidiary> // API mengembalikan subsidiary yang dihapus
}

export function createSubsidiariesResource(http: Http): SubsidiariesResource {
  const path = "/subsidiaries"

  return {
    list(query) {
      const parsed = SubsidiaryQuerySchema.parse(query ?? {})

      return http.request(z.array(SubsidiarySchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(SubsidiarySchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateSubsidiarySchema.parse(data)

      return http.request(SubsidiarySchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateSubsidiarySchema.parse(data)

      return http.request(SubsidiarySchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      // API mengembalikan subsidiary yang dihapus
      return http.request(SubsidiarySchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}