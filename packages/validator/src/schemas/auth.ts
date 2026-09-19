import { z } from "zod"

/**
 * ============================================================
 *  Auth Validator Schemas
 * ============================================================
 *
 * Zod schemas untuk endpoint autentikasi (login).
 * SSOT — digunakan oleh both API controller & web client.
 */

/**
 * Schema untuk login — email + password
 */
export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

/**
 * Schema untuk auth response
 */
export const AuthResponseSchema = z.object({
  token: z.string(),
})

// ====================== Types ======================

/** Type untuk login body */
export type LoginBody = z.infer<typeof LoginSchema>

/** Type untuk auth response */
export type AuthResponse = z.infer<typeof AuthResponseSchema>
