import { z } from "zod"

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
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

export class ValidationError extends Error {
  readonly errors: z.ZodIssue[]
  readonly data: unknown

  constructor(errors: z.ZodIssue[], data?: unknown) {
    super("Response validation failed")
    this.name = "ValidationError"
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

export function createHttp(baseUrl: string): Http {
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

    let response: Response
    try {
      response = await fetch(buildUrl(path, query), {
        method,
        headers: {
          "Content-Type": "application/json",
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

    if (!response.ok) {
      const message =
        (rawData as Record<string, unknown> | null)?.message ??
        `Request failed with status ${response.status}`
      throw new ApiError(response.status, String(message), rawData)
    }

    const result = schema.safeParse(rawData)

    if (!result.success) {
      throw new ValidationError(result.error.issues, rawData)
    }

    return result.data
  }

  return { request }
}