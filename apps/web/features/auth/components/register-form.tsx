"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { Button } from "@packages/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"

import { useAuth } from "@/features/auth/hooks"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"
import type { Role } from "@packages/validator"

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    email?: string
    password?: string
    roleId?: string
  }>({})
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    let active = true

    async function loadRoles() {
      try {
        const data = await api.resources.roles.list({ limit: 100 })
        if (active) setRoles(data)
      } catch {
        // silently fail
      }
    }

    void loadRoles()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)
    const username = (formData.get("username") as string)?.trim() ?? ""
    const email = (formData.get("email") as string)?.trim() ?? ""
    const password = (formData.get("password") as string) ?? ""
    const roleId = (formData.get("roleId") as string) ?? ""

    // Client-side validation
    const errors: typeof fieldErrors = {}
    if (username.length < 3) errors.username = "Username minimal 3 karakter"
    if (!email.includes("@")) errors.email = "Email tidak valid"
    if (password.length < 8) errors.password = "Password minimal 8 karakter"
    if (!roleId) errors.roleId = "Role wajib dipilih"

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      await register({ username, email, password, roleId })
      router.push(ROUTES.role)
      router.refresh()
    } catch (err) {
      setError(getErrorMessage(err, "Register gagal. Silakan coba lagi."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-5" />
            </div>
          </div>
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>Daftar untuk mulai menggunakan Documan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.username && (
                  <p className="text-sm text-destructive">{fieldErrors.username}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@documan.id"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="roleId">Role</FieldLabel>
                <select
                  id="roleId"
                  name="roleId"
                  required
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Pilih role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title}
                    </option>
                  ))}
                </select>
                {fieldErrors.roleId && (
                  <p className="text-sm text-destructive">{fieldErrors.roleId}</p>
                )}
              </Field>

              <Field className="mb-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Mendaftar..." : "Daftar"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldDescription className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <a
              href="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Masuk
            </a>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}