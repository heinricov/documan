import { createClient } from "@packages/client"

const TOKEN_KEY = "documan_token"

function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null)
  return Promise.resolve(localStorage.getItem(TOKEN_KEY))
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export const api = createClient({
  getToken,
  // Token interceptor global: 401 dengan Authorization → token invalid/expired.
  // Hapus token & arahkan ke halaman login (login page sudah handle redirect jika sudah login).
  onUnauthorized: () => {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.assign("/auth/login")
    }
  },
})
