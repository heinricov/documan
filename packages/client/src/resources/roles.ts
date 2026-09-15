import { z } from "zod"
import type { Http } from "../http.js"
import {
  CreateRoleSchema,
  RoleSchema,
  RoleQuerySchema,
  UpdateRoleSchema,
} from "@packages/validator"
import type { CreateRole, Role, RoleQuery, UpdateRole } from "@packages/validator"

export interface RolesResource {
  list(query?: RoleQuery): Promise<Role[]>
  get(id: string): Promise<Role>
  create(data: CreateRole): Promise<Role>
  update(id: string, data: UpdateRole): Promise<Role>
  remove(id: string): Promise<void>
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
        method: "PUT",
        body: parsed,
      })
    },

    async remove(id) {
      await http.request(z.nullable(z.unknown()), `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}