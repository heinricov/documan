import { hash, verify, hashSync } from "@node-rs/argon2"

/**
 * ============================================================
 *  Types
 * ============================================================
 */

export interface PasswordOptions {
  /**
   * Jumlah memori dalam kilobytes (default 19456 ≈ 19 MiB).
   */
  memoryCost?: number
  /**
   * Jumlah iterasi (default 2).
   */
  timeCost?: number
  /**
   * Jumlah segmen paralel (default 1). Ubah hanya jika perlu.
   */
  parallelism?: number
}

export type VerifyPasswordResult =
  | { ok: true; password: string }
  | { ok: false; password: false; reason: "not-matched" | "invalid-hash" }

/**
 * ============================================================
 *  Options
 * ============================================================
 */

/**
 * Opsi default untuk hashing — argon2id adalah default yang
 * direkomendasikan (lawan side-channel & GPU cracking).
 */
const DEFAULT_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} satisfies PasswordOptions

/**
 * Hash sebuah password menggunakan Argon2id.
 *
 * @example
 * ```ts
 * const hash = await hashPassword("secret")
 * // "$argon2id$v=19$m=19456,t=2,p=1$..."
 * ```
 */
export async function hashPassword(
  password: string,
  options: PasswordOptions = {}
): Promise<string> {
  if (!password) {
    throw new Error("Password cannot be empty.")
  }

  return hash(password, {
    ...DEFAULT_OPTIONS,
    ...options,
  })
}

/**
 * Memverifikasi password terhadap hash yang tersimpan.
 * Tidak pernah melempar error — jika hash tidak valid, return
 * `{ ok: false, reason: "invalid-hash" }`.
 *
 * @example
 * ```ts
 * const result = await verifyPassword(hash, "secret")
 * if (result.ok) {
 *   console.log("Login sukses", result.password)
 * }
 * ```
 */
export async function verifyPassword(
  hashToVerify: string,
  password: string,
  options: PasswordOptions = {}
): Promise<VerifyPasswordResult> {
  if (!password) {
    return { ok: false, password: false, reason: "not-matched" }
  }

  try {
    const matched = await verify(hashToVerify, password, {
      ...DEFAULT_OPTIONS,
      ...options,
    })

    return matched
      ? { ok: true, password }
      : { ok: false, password: false, reason: "not-matched" }
  } catch {
    return { ok: false, password: false, reason: "invalid-hash" }
  }
}

/**
 * Versi sinkron — berguna untuk test / setup script.
 */
export function hashPasswordSync(
  password: string,
  options: PasswordOptions = {}
): string {
  if (!password) {
    throw new Error("Password cannot be empty.")
  }

  // hashSync disediakan oleh @node-rs/argon2
  return hashSync(password, { ...DEFAULT_OPTIONS, ...options })
}