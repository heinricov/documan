/**
 * ============================================================
 *  Startup Environment Validation (fail-fast)
 * ============================================================
 *
 * Validasi konfigurasi env yang shared di monorepo. Melempar Error
 * untuk kondisi fatal (app tidak boleh jalan), dan mengembalikan
 * daftar warnings (string[]) yang terserah caller ingin log sebagai apa.
 *
 * Sengaja TIDAK bergantung pada logger package manapun — layer ini
 * paling rendah dan hanya butuh process.env.
 *
 * @example
 * ```ts
 * // apps/api → main.ts
 * const warnings = validateEnv({
 *   required: ["DATABASE_URL"],
 *   jwt: { minLength: 32 },
 *   cors: true,
 * })
 * for (const warning of warnings) logger.warn(warning)
 * ```
 */

export interface ValidateEnvOptions {
  /**
   * Variabel WAJIB ada — missing akan melempar Error fatal.
   * Contoh: ["DATABASE_URL"]
   */
  required?: string[]
  /**
   * Aturan JWT_SECRET. `false` untuk menonaktifkan pemeriksaan.
   * - production: missing / < minLength / placeholder → fatal
   * - non-production: hanya warning
   */
  jwt?: false | { minLength?: number }
  /**
   * Saat true dan production: `CORS_ORIGIN` kosong / "*" diberi warning
   * (API terbuka untuk semua origin).
   */
  cors?: boolean
  /** Override deteksi production (default: NODE_ENV === "production") */
  production?: boolean
  /** Sumber env (default: process.env — override utk testing) */
  env?: Record<string, string | undefined>
}

const WEAK_SECRETS = [
  "change-me",
  "changeme",
  "secret",
  "password",
  "your-secret",
]

function isWeakSecret(value: string): boolean {
  return WEAK_SECRETS.some((token) => value.toLowerCase().includes(token))
}

/**
 * Validasi env. Throw Error bila ada konfigurasi fatal;
 * return `string[]` berisi warning (UMUMnya untuk lingkungan dev).
 */
export function validateEnv(options: ValidateEnvOptions = {}): string[] {
  const {
    required = [],
    jwt = { minLength: 32 },
    cors = false,
    production,
    env = process.env,
  } = options

  const isProduction = production ?? env.NODE_ENV === "production"
  const warnings: string[] = []

  // ---------- Required vars (fatal) ----------
  for (const key of required) {
    if (!env[key]) {
      throw new Error(
        `FATAL: ${key} tidak diset. Salin .env.example ke .env ` +
          "dan isi nilai yang diperlukan."
      )
    }
  }

  // ---------- JWT_SECRET ----------
  if (jwt !== false) {
    const minLength = jwt?.minLength ?? 32
    const secret = env.JWT_SECRET
    const secretMissing = !secret
    const secretWeak = !secretMissing && isWeakSecret(secret!)

    if (isProduction) {
      const problems: string[] = []

      if (secretMissing) {
        problems.push("JWT_SECRET tidak diset")
      } else if (secret!.length < minLength) {
        problems.push(`JWT_SECRET terlalu pendek (minimal ${minLength} karakter)`)
      } else if (secretWeak) {
        problems.push("JWT_SECRET menggunakan placeholder/tidak kuat")
      }

      if (problems.length > 0) {
        throw new Error(
          `FATAL: Konfigurasi tidak aman untuk production: ${problems.join(
            "; "
          )}. ` + `Gunakan nilai acak >= ${minLength} char via: openssl rand -base64 48`
        )
      }
    } else if (secretMissing || secretWeak) {
      warnings.push(
        "JWT_SECRET belum diset / lemah di environment dev — " +
          "autentikasi (@packages/auth) akan gagal sampai diisi."
      )
    }
  }

  // ---------- CORS di production ----------
  const corsOrigin = env.CORS_ORIGIN?.trim()
  if (cors && isProduction && (!corsOrigin || corsOrigin === "*")) {
    warnings.push(
      'CORS_ORIGIN diset "*" (allow all) di production. ' +
        "Batasi origin agar API tidak terbuka untuk semua situs."
    )
  }

  return warnings
}