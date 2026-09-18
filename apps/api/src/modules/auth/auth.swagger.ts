import { UserSchema } from "@packages/validator"
import { zodToOpenApi } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Auth
 * ============================================================
 *
 * Login/Register schemas dibuat manual untuk OpenAPI.
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

export const registerSchema = {
  type: "object",
  required: ["username", "email", "password", "roleId"],
  properties: {
    username: {
      type: "string",
      minLength: 3,
      maxLength: 50,
      example: "johndoe",
      description: "Username unik",
    },
    email: {
      type: "string",
      format: "email",
      example: "john@documan.id",
      description: "Email unik",
    },
    password: {
      type: "string",
      minLength: 8,
      example: "securepass123",
      description: "Password minimal 8 karakter",
    },
    roleId: {
      type: "string",
      format: "uuid",
      example: "550e8400-e29b-41d4-a716-446655440000",
      description: "UUID role yang akan diberikan ke user",
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