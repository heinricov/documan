import { z } from "zod"
import type { Http } from "../http"
import {
  LoginSchema,
  RegisterSchema,
  UserSchema,
  type LoginBody,
  type RegisterBody,
  type User,
} from "@packages/validator"

/**
 * Auth response type — token + user data
 */
export interface AuthResult {
  token: string
  user: User
}

export interface AuthResource {
  login(data: LoginBody): Promise<AuthResult>
  register(data: RegisterBody): Promise<AuthResult>
  me(): Promise<User>
}

export function createAuthResource(http: Http): AuthResource {
  const path = "/auth"

  return {
    login(data) {
      const parsed = LoginSchema.parse(data)

      return http.request(z.any(), `${path}/login`, {
        method: "POST",
        body: parsed,
      }) as Promise<AuthResult>
    },

    register(data) {
      const parsed = RegisterSchema.parse(data)

      return http.request(z.any(), `${path}/register`, {
        method: "POST",
        body: parsed,
      }) as Promise<AuthResult>
    },

    me() {
      return http.request(UserSchema, `${path}/me`, {
        method: "GET",
      })
    },
  }
}