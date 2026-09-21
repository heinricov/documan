import { z } from "zod"
import type { Http } from "../http"
import {
  LoginSchema,
  UserSchema,
  type LoginBody,
  type User,
} from "@packages/validator"

/**
 * Auth response type — accessToken + user data
 */
export interface AuthResult {
  accessToken: string
  user: User
}

export interface RefreshResult {
  accessToken: string
}

export interface AuthResource {
  login(data: LoginBody): Promise<AuthResult>
  me(): Promise<User>
  refresh(): Promise<RefreshResult>
  logout(): Promise<{ message: string }>
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

    me() {
      return http.request(UserSchema, `${path}/me`, {
        method: "GET",
      })
    },

    refresh() {
      return http.request(z.any(), `${path}/refresh`, {
        method: "POST",
      }) as Promise<RefreshResult>
    },

    logout() {
      return http.request(z.any(), `${path}/logout`, {
        method: "POST",
      }) as Promise<{ message: string }>
    },
  }
}