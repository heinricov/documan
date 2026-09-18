"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormUser } from "@/features/user/components"
import { useUser } from "@/features/user/hooks"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.user

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params?.id

  const { user, isLoading, error } = useUser(userId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat user...</p>
      </section>
    )
  }

  if (error || !user) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "User tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar user
        </Button>
      </section>
    )
  }

  return (
    <FormUser
      mode="edit"
      userId={user.id}
      initialData={{
        username: user.username,
        email: user.email,
        roleId: user.roleId,
      }}
    />
  )
}
