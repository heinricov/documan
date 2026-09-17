import { z } from "zod"
import type { Http } from "../http"
import {
  CreateRoleSchema,
  RoleSchema,
  RoleQuerySchema,
  UpdateRoleSchema,
  type CreateRole,
  type Role,
  type UpdateRole,
} from "@packages/validator/schemas/role"

export interface RolesResource {
  list(query?: z.input<typeof RoleQuerySchema>): Promise<Role[]>
  get(id: string): Promise<Role>
  create(data: CreateRole): Promise<Role>
  update(id: string, data: UpdateRole): Promise<Role>
  remove(id: string): Promise<Role> // API mengembalikan role yang dihapus
}

export function createRolesResource(http: Http): RolesResource {
  const path = "/roles"

  return {
    list(query) {
      const parsed = RoleQuerySchema.parse(query ?? {})

      return http.request(z.array(RoleSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(RoleSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateRoleSchema.parse(data)

      return http.request(RoleSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateRoleSchema.parse(data)

      return http.request(RoleSchema, `${path}/${id}`, {
        method: "PATCH", // ← sebelumnya PUT
        body: parsed,
      })
    },

    remove(id) {
      // API mengembalikan role yang dihapus
      return http.request(RoleSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}
