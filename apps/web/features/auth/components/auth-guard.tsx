"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/features/auth/hooks"

/**
 * ============================================================
 *  AuthGuard Component
 * ============================================================
 *
 * Melindungi route yang memerlukan autentikasi.
 * Jika user belum login, redirect ke /auth/login.
 *
 * @example
 * ```tsx
 * // Di layout atau page
 * <AuthGuard>
 *   <DashboardContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Tampilkan loading saat memverifikasi session
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat sesi...</p>
        </div>
      </div>
    )
  }

  // Jangan render children jika belum login (sedang redirect)
  if (!user) return null

  return <>{children}</>
}