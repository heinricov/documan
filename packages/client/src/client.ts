import { createHttp } from "./http"
import { createResources } from "./resources/index"
import type { Resources } from "./resources/index"

export interface ClientOptions {
  baseUrl?: string
  /**
   * Fungsi async yang mengembalikan JWT token.
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

  const http = createHttp(baseUrl, options.getToken)
  const resources = createResources(http)

  return { resources }
}

export default createClient
