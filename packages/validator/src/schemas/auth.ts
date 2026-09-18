import { z } from "zod"

/**
 * ============================================================
 *  Auth Validator Schemas
 * ============================================================
 *
 * Zod schemas untuk endpoint autentikasi (login & register).
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
 * Schema untuk register — buat akun baru
 */
export const RegisterSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50, "Username maksimal 50 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  roleId: z.string().uuid("Role ID tidak valid"),
})

/**
 * Schema untuk auth response (login/register)
 */
export const AuthResponseSchema = z.object({
  token: z.string(),
})

// ====================== Types ======================

/** Type untuk login body */
export type LoginBody = z.infer<typeof LoginSchema>

/** Type untuk register body */
export type RegisterBody = z.infer<typeof RegisterSchema>

/** Type untuk auth response */
export type AuthResponse = z.infer<typeof AuthResponseSchema>
