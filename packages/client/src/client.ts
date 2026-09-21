import { createHttp } from "./http"
import { createResources } from "./resources/index"
import type { Resources } from "./resources/index"

export interface ClientOptions {
  baseUrl?: string
  /**
   * Fungsi async yang mengembalikan JWT access token.
   * Jika diset, setiap request otomatis mengirim header
   * `Authorization: Bearer <token>`.
   *
   * @example
   * ```ts
   * const client = createClient({
   *   getToken: () => localStorage.getItem("token"),
   * })
   * ```
   */
  getToken?: () => Promise<string | null>
  /**
   * Dipanggil saat API mengembalikan HTTP 401 dan request membawa
   * Authorization header (token tidak valid/expired).
   *
   * Cocok untuk interceptor global: clear token + redirect ke login.
   * TIDAK dipanggil untuk 401 tanpa token (mis. login dengan password salah).
   */
  onUnauthorized?: () => void
  /**
   * Dipanggil saat 401 untuk mencoba silent refresh.
   * Harus mengembalikan access token baru atau null jika gagal.
   * Refresh token dikirim otomatis via HttpOnly cookie.
   */
  onRefresh?: () => Promise<string | null>
}

export interface Client {
  resources: Resources
}

export type { Resources }

export function createClient(options: ClientOptions = {}): Client {
  const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. " +
        "Set it in .env or pass baseUrl to createClient."
    )
  }

  const http = createHttp({
    baseUrl,
    getToken: options.getToken,
    onUnauthorized: options.onUnauthorized,
    onRefresh: options.onRefresh,
  })
  const resources = createResources(http)

  return { resources }
}

export default createClient