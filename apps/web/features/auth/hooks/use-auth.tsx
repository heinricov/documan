"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { User } from "@packages/validator"
import { api } from "@/lib/api"
import { setToken, clearToken, getToken } from "@/lib/api"

/**
 * ============================================================
 *  Auth Context Types
 * ============================================================
 */

export interface AuthContextValue {
  /** User yang sedang login (null jika belum login) */
  user: User | null
  /** Token JWT access token saat ini */
  token: string | null
  /** Status loading saat memuat sesi awal */
  isLoading: boolean
  /** Login dengan email + password */
  login: (email: string, password: string) => Promise<void>
  /** Logout — hapus token & reset state */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * ============================================================
 *  AuthProvider
 * ============================================================
 *
 * Provider untuk session management.
 * - Saat mount, coba ambil user via GET /auth/me (access token dari memory)
 * - Jika gagal (token expired/tidak ada), coba silent refresh via POST /auth/refresh
 * - Jika refresh berhasil, retry GET /auth/me
 * - Jika semua gagal, state = unauthenticated
 * - Token access token disimpan di memory saja (bukan localStorage)
 * - Refresh token disimpan di HttpOnly cookie (dikelola server)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session saat mount
  useEffect(() => {
    let active = true

    async function loadSession() {
      // First, try to get user with current access token (from memory)
      const storedToken = await getToken()

      if (storedToken) {
        setTokenState(storedToken)
        try {
          const userData = await api.resources.auth.me()
          if (active) setUser(userData)
          if (active) setIsLoading(false)
          return
        } catch {
          // Token expired/invalid - will try refresh below
        }
      }

      // No token or expired - try silent refresh using HttpOnly cookie
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          const newAccessToken = data?.accessToken ?? data?.data?.accessToken

          if (newAccessToken) {
            setToken(newAccessToken)
            setTokenState(newAccessToken)

            // Now try to get user with new token
            try {
              const userData = await api.resources.auth.me()
              if (active) setUser(userData)
              if (active) setIsLoading(false)
              return
            } catch {
              // me() failed even with new token
            }
          }
        }
      } catch {
        // Refresh failed
      }

      // All attempts failed - unauthenticated
      if (active) {
        setTokenState(null)
        setUser(null)
        setIsLoading(false)
      }
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.resources.auth.login({ email, password })
    setToken(result.accessToken)
    setTokenState(result.accessToken)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    // Call API logout to clear HttpOnly cookie
    try {
      await api.resources.auth.logout()
    } catch {
      // Ignore logout API errors
    }
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * ============================================================
 *  useAuth Hook
 * ============================================================
 *
 * Akses auth state & actions.
 *
 * @example
 * ```tsx
 * const { user, login, logout, isLoading } = useAuth()
 *
 * if (isLoading) return <Spinner />
 * if (!user) return <LoginForm onSubmit={login} />
 * ```
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error("useAuth() harus digunakan di dalam <AuthProvider>")
  }

  return ctx
}