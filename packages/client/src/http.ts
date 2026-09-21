import { z } from "zod"

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown
  readonly code?: string | number

  constructor(status: number, message: string, data?: unknown, code?: string | number) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
    this.code = code
  }
}

export class NetworkError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = "NetworkError"
    this.cause = cause
  }
}

export class ResponseValidationError extends Error {
  readonly errors: z.ZodIssue[]
  readonly data: unknown

  constructor(errors: z.ZodIssue[], data?: unknown) {
    super("Response validation failed")
    this.name = "ResponseValidationError"
    this.errors = errors
    this.data = data
  }
}

export interface HttpOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  query?: Record<string, unknown>
  signal?: AbortSignal
}

/**
 * Callback untuk mendapatkan access token (untuk Authorization header).
 * Returns token atau null.
 */
export type GetToken = () => Promise<string | null>

/**
 * Callback yang dipanggil saat 401 Unauthorized dengan valid Authorization header.
 * Biasanya: clear token + redirect ke login.
 */
export type OnUnauthorized = () => void

/**
 * Callback untuk silent refresh — dipanggil saat 401.
 * Returns new access token jika berhasil, null jika gagal (mis. refresh token expired).
 */
export type OnRefresh = () => Promise<string | null>

export interface HttpClientConfig {
  baseUrl: string
  getToken?: GetToken
  onUnauthorized?: OnUnauthorized
  onRefresh?: OnRefresh
}

/**
 * Type alias for the HTTP client interface
 */
export type Http = HttpClient

export interface HttpClient {
  request<T>(
    schema: z.ZodType<T>,
    path: string,
    options?: HttpOptions
  ): Promise<T>
}

function unwrapResponse(data: unknown): unknown {
  if (!data || typeof data !== "object") return data

  const obj = data as Record<string, unknown>
  if (obj.success === true && "data" in obj) return obj.data
  return data
}

export function createHttp(config: HttpClientConfig): HttpClient {
  const { baseUrl, getToken, onUnauthorized, onRefresh } = config

  function buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(path, baseUrl)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue
        url.searchParams.set(key, String(value))
      }
    }

    return url.toString()
  }

  async function request<T>(
    schema: z.ZodType<T>,
    path: string,
    options: HttpOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers, query, signal } = options

    // Build auth header jika getToken tersedia
    const authHeader: Record<string, string> = {}
    if (getToken) {
      const token = await getToken()
      if (token) {
        authHeader.Authorization = `Bearer ${token}`
      }
    }

    let response: Response
    try {
      response = await fetch(buildUrl(path, query), {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader,
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
        // Important: include credentials so HttpOnly cookies are sent
        credentials: "include",
      })
    } catch (error) {
      throw new NetworkError(
        `Network error while calling ${method} ${path}`,
        error
      )
    }

    // Silent refresh on 401 with Authorization header
    if (
      response.status === 401 &&
      authHeader.Authorization &&
      onRefresh
    ) {
      const newToken = await onRefresh()
      if (newToken) {
        // Retry request with new token
        const retryResponse = await fetch(buildUrl(path, query), {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${newToken}`,
            ...headers,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
          credentials: "include",
        })

        if (retryResponse.ok) {
          response = retryResponse
        } else if (retryResponse.status === 401 && onUnauthorized) {
          // Refresh failed - call onUnauthorized
          onUnauthorized()
        }
      } else if (onUnauthorized) {
        // Refresh failed completely
        onUnauthorized()
      }
    }

    // Token interceptor: 401 + request membawa Authorization header
    // → token tidak valid / sudah expired. Panggil onUnauthorized
    // Catatan: 401 dari login (tanpa token) TIDAK memicu ini.
    if (onUnauthorized && response.status === 401 && authHeader.Authorization) {
      onUnauthorized()
    }

    const rawData = await response.json().catch(() => null)

    // Handle HTTP error status
    if (!response.ok) {
      // Coba ambil pesan dari format standar API
      let message = `Request failed with status ${response.status}`
      let code: string | undefined

      if (rawData && typeof rawData === "object") {
        const obj = rawData as Record<string, unknown>
        if (
          obj.success === false &&
          obj.error &&
          typeof obj.error === "object"
        ) {
          const err = obj.error as Record<string, unknown>
          if (typeof err.message === "string") message = err.message
          if (typeof err.code === "string") code = err.code
        } else if (typeof obj.message === "string") {
          message = obj.message
        }
      }

      throw new ApiError(response.status, message, rawData, code)
    }

    // Unwrap { success: true, data: ... }
    const payload = unwrapResponse(rawData)

    // Deteksi error yang terbungkus di body meski status 200 (jarang, tapi aman)
    const apiError = payload as {
      __apiError?: unknown
      message?: string
      code?: string
      details?: unknown
    } | null

    if (
      apiError &&
      typeof apiError === "object" &&
      apiError.__apiError === true
    ) {
      throw new ApiError(
        response.status,
        apiError.message ?? "Request failed",
        rawData,
        apiError.code ? Number(apiError.code) : undefined
      )
    }

    const result = schema.safeParse(payload)

    if (!result.success) {
      throw new ResponseValidationError(result.error.issues, payload)
    }

    return result.data
  }

  return { request }
}