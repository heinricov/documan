/**
 * @packages/auth
 *
 * Authentication & authorization utilities untuk api & web.
 * JWT signing/verification, password hashing, dan guards.
 */

// ====================== JWT ======================
export {
  AuthError,
  getJwtSecret,
  signToken,
  verifyToken,
  getUserId,
} from "./jwt.js"

export type {
  AuthTokenPayload,
  JwtOptions,
  VerifyOptions,
  VerifyResult,
} from "./jwt.js"

// ====================== Password ======================
export {
  hashPassword,
  hashPasswordSync,
  verifyPassword,
} from "./password.js"

export type {
  PasswordOptions,
  VerifyPasswordResult,
} from "./password.js"

// ====================== Guards ======================
export {
  requireAuth,
  requireRole,
  requireAuthAndRole,
  getBearerToken,
} from "./guards.js"

export type {
  AuthContext,
  AuthGuardResult,
  RequireRoleOptions,
} from "./guards.js"