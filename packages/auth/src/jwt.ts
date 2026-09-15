import { SignJWT, jwtVerify, type JWTPayload } from "jose"

/**
 * ============================================================
 *  Errors
 * ============================================================
 */

export class AuthError extends Error {
  readonly code:
    | "JWT_SECRET_NOT_SET"
    | "INVALID_TOKEN"
    | "TOKEN_EXPIRED"

  constructor(
    code: AuthError["code"],
    message: string
  ) {
    super(message)
    this.name = "AuthError"
    this.code = code
  }
}

/**
 * ============================================================
 *  Types
 * ============================================================
 */

/**
 * Custom claims yang disarankan di dalam JWT payload.
 * userId & role adalah kata kunci yang dipakai guards.
 */
export interface AuthTokenPayload {
  userId: string
  role?: string
  [key: string]: unknown
}

export interface JwtOptions {
  /** Secret override — default dari env JWT_SECRET */
  secret?: string
  /** Expiry — default dari env JWT_EXPIRES_IN ?? "15m" */
  expiresIn?: string
  /** Issuer — default dari env JWT_ISSUER ?? "documan" */
  issuer?: string
}

export interface VerifyOptions {
  /** Secret override — default dari env JWT_SECRET */
  secret?: string
  /** Issuer yang diharapkan — default dari env JWT_ISSUER ?? "documan" */
  issuer?: string
}

export type VerifyResult<T extends object = object> = T & JWTPayload

/**
 * ============================================================
 *  Helpers
 * ============================================================
 */

/**
 * Ambil JWT secret dari env. Untuk production WAJIB diset.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new AuthError(
      "JWT_SECRET_NOT_SET",
      "JWT_SECRET environment variable is not set. " +
        "Set it in .env or pass secret to signToken/verifyToken."
    )
  }

  return secret
}

function toSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

/**
 * ============================================================
 *  Sign / Verify
 * ============================================================
 */

/**
 * Membuat JWT token dari payload.
 *
 * @example
 * ```ts
 * const token = await signToken({ userId: "abc", role: "admin" })
 * // Default: HS256, expires 15m, issuer "documan"
 * ```
 *
 * @example
 * ```ts
 * const token = await signToken({ userId: "abc" }, {
 *   expiresIn: "1d",
 *   secret: "custom-secret",
 * })
 * ```
 */
export async function signToken(
  payload: AuthTokenPayload,
  options: JwtOptions = {}
): Promise<string> {
  const secret = options.secret ?? getJwtSecret()
  const expiresIn = options.expiresIn ?? process.env.JWT_EXPIRES_IN ?? "15m"
  const issuer = options.issuer ?? process.env.JWT_ISSUER ?? "documan"

  const { userId, role, ...rest } = payload

  const claims: Record<string, unknown> = { ...rest }
  if (role) {
    claims.role = role
  }

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer(issuer)
    .sign(toSecretKey(secret))
}

/**
 * Memverifikasi JWT token dan mengembalikan payload.
 * Melempar AuthError jika tidak valid / expired.
 *
 * @example
 * ```ts
 * const payload = await verifyToken(token)
 * // payload.sub = userId, payload.role = "admin"
 * ```
 */
export async function verifyToken<T extends object = object>(
  token: string,
  options: VerifyOptions = {}
): Promise<VerifyResult<T>> {
  const secret = options.secret ?? getJwtSecret()
  const issuer = options.issuer ?? process.env.JWT_ISSUER ?? "documan"

  try {
    const { payload } = await jwtVerify(token, toSecretKey(secret), {
      issuer,
    })

    return payload as VerifyResult<T>
  } catch (error) {
    if (error instanceof AuthError) throw error

    const message = error instanceof Error ? error.message : "Invalid token"
    const expired =
      message.toLowerCase().includes("expired") ||
      message.toLowerCase().includes("exp timestamp")

    throw new AuthError(
      expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      expired
        ? "Token has expired. Please login again."
        : "Invalid or malformed token."
    )
  }
}

/**
 * Ambil userId dari token yang sudah diverifikasi.
 * Berguna untuk endpoint yang butuh current user.
 *
 * @example
 * ```ts
 * const { userId } = await getUserId(token)
 * ```
 */
export async function getUserId(
  token: string,
  options?: VerifyOptions
): Promise<string> {
  const payload = await verifyToken(token, options)

  if (!payload.sub) {
    throw new AuthError("INVALID_TOKEN", "Token does not contain a subject.")
  }

  return payload.sub
}