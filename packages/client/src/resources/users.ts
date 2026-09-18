import { z } from "zod"
import type { Http } from "../http"
import {
  CreateUserSchema,
  UserSchema,
  UserQuerySchema,
  UpdateUserSchema,
  type CreateUser,
  type User,
  type UpdateUser,
} from "@packages/validator"

export interface UsersResource {
  list(query?: z.input<typeof UserQuerySchema>): Promise<User[]>
  get(id: string): Promise<User>
  create(data: CreateUser): Promise<User>
  update(id: string, data: UpdateUser): Promise<User>
  remove(id: string): Promise<User> // API mengembalikan user yang dihapus
}

export function createUsersResource(http: Http): UsersResource {
  const path = "/users"

  return {
    list(query) {
      const parsed = UserQuerySchema.parse(query ?? {})

      return http.request(z.array(UserSchema), path, {
        method: "GET",
        query: parsed as Record<string, unknown>,
      })
    },

    get(id) {
      return http.request(UserSchema, `${path}/${id}`, { method: "GET" })
    },

    create(data) {
      const parsed = CreateUserSchema.parse(data)

      return http.request(UserSchema, path, {
        method: "POST",
        body: parsed,
      })
    },

    update(id, data) {
      const parsed = UpdateUserSchema.parse(data)

      return http.request(UserSchema, `${path}/${id}`, {
        method: "PATCH",
        body: parsed,
      })
    },

    remove(id) {
      // API mengembalikan user yang dihapus
      return http.request(UserSchema, `${path}/${id}`, {
        method: "DELETE",
      })
    },
  }
}
