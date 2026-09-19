import { z } from "zod"
import type { Http } from "../http"
import {
  CreatePartnerSchema,
  PartnerSchema,
  PartnerQuerySchema,
  UpdatePartnerSchema,
  type CreatePartner,
  type Partner,
  type UpdatePartner,
} from "@packages/validator"

export interface PartnersResource {
  list(query?: z.input<typeof PartnerQuerySchema>): Promise<Partner[]>
  get(id: string): Promise<Partner>
  create(data: CreatePartner): Promise<Partner>
  update(id: string, data: UpdatePartner): Promise<Partner>
  remove(id: string): Promise<Partner>
}

export function createPartnersResource(http: Http): PartnersResource {
  const path = "/partners"

  return {
    list(query) {
      const parsed = PartnerQuerySchema.parse(query ?? {})

      return http.request(z.array(PartnerSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(PartnerSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreatePartnerSchema.parse(data)

      return http.request(PartnerSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdatePartnerSchema.parse(data)

      return http.request(PartnerSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      return http.request(PartnerSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}