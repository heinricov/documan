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
import {
  setToken,
  clearToken,
  getStoredToken,
} from "@/lib/api"

/**
 * ============================================================
 *  Auth Context Types
 * ============================================================
 */

export interface AuthContextValue {
  /** User yang sedang login (null jika belum login) */
  user: User | null
  /** Token JWT saat ini */
  token: string | null
  /** Status loading saat memuat sesi awal */
  isLoading: boolean
  /** Login dengan email + password */
  login: (email: string, password: string) => Promise<void>
  /** Register akun baru */
  register: (data: {
    username: string
    email: string
    password: string
    roleId: string
  }) => Promise<void>
  /** Logout — hapus token & reset state */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * ============================================================
 *  AuthProvider
 * ============================================================
 *
 * Provider untuk session management.
 * - Saat mount, cek localStorage untuk token yang tersimpan
 * - Jika ada token, fetch data user dari API (GET /auth/me)
 * - Jika tidak ada token atau expired, state = unauthenticated
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session dari localStorage saat mount
  useEffect(() => {
    let active = true

    async function loadSession() {
      const storedToken = getStoredToken()

      if (!storedToken) {
        if (active) setIsLoading(false)
        return
      }

      try {
        setTokenState(storedToken)
        const userData = await api.resources.auth.me()
        if (active) setUser(userData)
      } catch {
        // Token expired / invalid — clear
        clearToken()
        if (active) {
          setTokenState(null)
          setUser(null)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.resources.auth.login({ email, password })
    setToken(result.token)
    setTokenState(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(
    async (data: {
      username: string
      email: string
      password: string
      roleId: string
    }) => {
      const result = await api.resources.auth.register(data)
      setToken(result.token)
      setTokenState(result.token)
      setUser(result.user)
    },
    []
  )

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
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