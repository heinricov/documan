"use client"

import { useState } from "react"
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
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = (formData.get("email") as string)?.trim() ?? ""
    const password = (formData.get("password") as string) ?? ""

    if (!email || !password) {
      setError("Email dan password wajib diisi.")
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      router.push(ROUTES.role)
      router.refresh()
    } catch (err) {
      setError(getErrorMessage(err, "Login gagal. Silakan coba lagi."))
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
          <CardTitle className="text-xl">Documan</CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@documan.id"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field className="mb-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Masuk..." : "Masuk"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldDescription className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <a
              href="/auth/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Daftar
            </a>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}