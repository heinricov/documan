import { z } from "zod"
import type { Http } from "../http"
import {
  BoxSchema,
  CreateBoxSchema,
  BoxQuerySchema,
  UpdateBoxSchema,
  type Box,
  type CreateBox,
  type UpdateBox,
} from "@packages/validator"

export interface BoxesResource {
  list(query?: z.input<typeof BoxQuerySchema>): Promise<Box[]>
  get(id: string): Promise<Box>
  create(data: CreateBox): Promise<Box>
  update(id: string, data: UpdateBox): Promise<Box>
  remove(id: string): Promise<Box>
}

export function createBoxesResource(http: Http): BoxesResource {
  const path = "/boxes"

  return {
    list(query) {
      const parsed = BoxQuerySchema.parse(query ?? {})

      return http.request(z.array(BoxSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(BoxSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateBoxSchema.parse(data)

      return http.request(BoxSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateBoxSchema.parse(data)

      return http.request(BoxSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      return http.request(BoxSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}