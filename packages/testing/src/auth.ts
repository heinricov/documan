import { signToken, type AuthTokenPayload } from "@packages/auth"

/**
 * ============================================================
 *  Auth Testing
 * ============================================================
 */

/**
 * Membuat JWT token untuk test.
 * Gunakan untuk request ke protected route via supertest/fetch.
 *
 * @example
 * ```ts
 * const token = await createTestToken({ userId: "user-1", role: "admin" })
 * ```
 */
export async function createTestToken(
  payload: Partial<AuthTokenPayload> = {}
): Promise<string> {
  return signToken({
    userId: "test-user",
    role: "admin",
    ...payload,
  })
}

/**
 * Membentuk header Authorization Bearer dari token.
 *
 * @example
 * ```ts
 * const token = await createTestToken()
 * await request(app).get("/roles").set("Authorization", authHeader(token))
 * ```
 */
export function authHeader(token: string): string {
  return `Bearer ${token}`
}