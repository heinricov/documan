import { createClient } from "@packages/client"

// In-memory token storage (no localStorage)
let accessToken: string | null = null

export function getToken(): Promise<string | null> {
  return Promise.resolve(accessToken)
}

export function setToken(token: string): void {
  accessToken = token
}

export function clearToken(): void {
  accessToken = null
}

/**
 * Silent refresh - called by HTTP client on 401.
 * Calls POST /auth/refresh which reads refresh token from HttpOnly cookie.
 */
export async function silentRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Important: include HttpOnly cookie
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const newAccessToken = data?.accessToken ?? data?.data?.accessToken

    if (newAccessToken) {
      accessToken = newAccessToken
      return newAccessToken
    }

    return null
  } catch {
    return null
  }
}

export const api = createClient({
  getToken,
  // Called when 401 AND refresh failed (or no refresh token)
  onUnauthorized: () => {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.assign("/auth/login")
    }
  },
  // Silent refresh on 401
  onRefresh: silentRefresh,
})