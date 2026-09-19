import { UserSchema } from "@packages/validator"
import { zodToOpenApi } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Auth
 * ============================================================
 *
 * Login schema dibuat manual untuk OpenAPI.
 * User schema dari @packages/validator (SSOT).
 */

export const userSchema = zodToOpenApi(UserSchema)

export const loginSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      example: "admin@documan.id",
      description: "Email yang terdaftar",
    },
    password: {
      type: "string",
      minLength: 1,
      example: "password123",
      description: "Password akun",
    },
  },
}

export const authResponseSchema = {
  type: "object",
  properties: {
    token: {
      type: "string",
      description: "JWT token untuk autentikasi",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    user: {
      type: "object",
      description: "Data user yang sedang login",
      properties: {
        id: { type: "string", format: "uuid" },
        username: { type: "string" },
        email: { type: "string", format: "email" },
        roleId: { type: "string", format: "uuid" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
}