import { z } from "zod"

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown
  readonly code?: string

  constructor(status: number, message: string, data?: unknown, code?: string) {
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
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  query?: Record<string, unknown>
  signal?: AbortSignal
}

export interface Http {
  request<T>(
    schema: z.ZodType<T>,
    path: string,
    options?: HttpOptions
  ): Promise<T>
}

/**
 * Unwrap format standar @packages/core:
 * - Sukses  → kembalikan `data`
 * - Error   → throw ApiError dengan pesan dari `error.message`
 */
function unwrapResponse(raw: unknown): unknown {
  if (raw === null || typeof raw !== "object") return raw

  const obj = raw as Record<string, unknown>

  // Format error standar
  if (obj.success === false && obj.error && typeof obj.error === "object") {
    const err = obj.error as Record<string, unknown>
    const message =
      typeof err.message === "string" ? err.message : "Request failed"
    const code = typeof err.code === "string" ? err.code : undefined
    // Kita throw di luar, jadi di sini cukup return null + biarkan caller handle
    // Tapi lebih bersih throw langsung di request()
    return { __apiError: true, message, code, details: err.details }
  }

  // Format sukses standar
  if (obj.success === true && "data" in obj) {
    return obj.data
  }

  // Fallback: response tidak berformat (misal health check)
  return raw
}

export function createHttp(
  baseUrl: string,
  getToken?: () => Promise<string | null>
): Http {
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
      })
    } catch (error) {
      throw new NetworkError(
        `Network error while calling ${method} ${path}`,
        error
      )
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
        apiError.code
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
