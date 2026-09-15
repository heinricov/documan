import { verifyToken } from "./jwt.js"

/**
 * ============================================================
 *  Types
 * ============================================================
 */

export interface AuthContext<User extends object = object> {
  /** Verified JWT payload */
  userId: string
  role?: string
  /** Raw JWT payload (termasuk claims) */
  payload?: User
  /** Token string asli */
  token: string
}

export type AuthGuardResult =
  | {
      ok: true
      context: AuthContext
    }
  | {
      ok: false
      reason: "unauthorized" | "forbidden" | "invalid"
      message: string
    }

export interface RequireRoleOptions {
  /** Role yang diizinkan — role token harus salah satu dari ini */
  roles: string[]
  /** Kalau true, role dari payload di-normalkan lowercase */
  caseInsensitive?: boolean
}

/**
 * ============================================================
 *  Guards
 * ============================================================
 */

/**
 * Basis dari semua guard — verifikasi JWT dan bangun AuthContext.
 * Tidak melempar error, mengembalikan result object sehingga
 * mudah digunakan di middleware/guard NestJS/Next.js.
 *
 * @example
 * ```ts
 * const result = await requireAuth(token)
 * if (!result.ok) { return 401 }
 * const { userId } = result.context
 * ```
 */
export async function requireAuth<T extends object = object>(
  token: string | undefined | null
): Promise<AuthGuardResult> {
  if (!token) {
    return {
      ok: false,
      reason: "unauthorized",
      message: "Missing authorization token.",
    }
  }

  try {
    const payload = await verifyToken<T>(token)

    if (!payload.sub) {
      return {
        ok: false,
        reason: "invalid",
        message: "Token does not contain a subject.",
      }
    }

    return {
      ok: true,
      context: {
        userId: payload.sub,
        role: typeof payload.role === "string" ? payload.role : undefined,
        payload,
        token,
      },
    }
  } catch {
    return {
      ok: false,
      reason: "invalid",
      message: "Invalid or expired token.",
    }
  }
}

/**
 * Cek otorisasi berbasis role setelah requireAuth.
 *
 * @example
 * ```ts
 * const auth = await requireAuth(token)
 * if (!auth.ok) { return 401 }
 *
 * const check = requireRole(auth.context, { roles: ["admin", "editor"] })
 * if (!check.ok) { return 403 }
 * ```
 */
export function requireRole(
  context: AuthContext,
  options: RequireRoleOptions
): { ok: true } | { ok: false; reason: "forbidden"; message: string } {
  const role = context.role as string | undefined

  if (!role) {
    return {
      ok: false,
      reason: "forbidden",
      message: "Token does not carry a role.",
    }
  }

  const allowed = options.caseInsensitive
    ? options.roles.map((r) => r.toLowerCase())
    : options.roles

  const hasRole = options.caseInsensitive
    ? allowed.includes(role.toLowerCase())
    : allowed.includes(role)

  if (!hasRole) {
    return {
      ok: false,
      reason: "forbidden",
      message: `Requires one of roles: ${options.roles.join(", ")}.`,
    }
  }

  return { ok: true }
}

/**
 * Helper untuk mengekstrak Bearer token dari header Authorization.
 * Mengembalikan token string, atau null jika format tidak valid.
 *
 * @example
 * ```ts
 * const token = getBearerToken(req.headers.authorization)
 * // "Bearer eyJhbGci..."  → token
 * // undefined / "Basic ..." → null
 * ```
 */
export function getBearerToken(
  authorizationHeader: string | undefined | null
): string | null {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token, ...rest] = authorizationHeader.split(" ")

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    rest.length > 0
  ) {
    return null
  }

  return token
}

/**
 * Guard gabungan: verifikasi token + cek role dalam satu panggilan.
 *
 * @example
 * ```ts
 * const result = await requireAuthAndRole(token, { roles: ["admin"] })
 * if (!result.ok) { return result.reason === "forbidden" ? 403 : 401 }
 * ```
 */
export async function requireAuthAndRole(
  token: string | undefined | null,
  options: RequireRoleOptions
): Promise<AuthGuardResult> {
  if (!token) {
    return {
      ok: false,
      reason: "unauthorized",
      message: "Missing authorization token.",
    }
  }

  const auth = await requireAuth(token)
  if (!auth.ok) return auth

  const roleCheck = requireRole(auth.context, options)
  if (!roleCheck.ok) return roleCheck

  return auth
}