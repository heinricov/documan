"use client"

import { useAuth } from "@/features/auth/hooks"
import { RegisterForm } from "@/features/auth/components/register-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ROUTES } from "@/lib/constants"

export default function RegisterPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (!isLoading && user) {
      router.push(ROUTES.role)
    }
  }, [user, isLoading, router])

  // Tampilkan loading saat cek session
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  // Jangan tampilkan form jika sudah login (sedang redirect)
  if (user) return null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  )
}