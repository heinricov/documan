"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@packages/ui/components/button"

import { FormRole } from "@/components/form-role"
import { baseUrl } from "@/components/table-role"
import { useRole } from "@/hooks/use-role"

export default function EditRolePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const roleId = params?.id

  const { role, isLoading, error } = useRole(roleId)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat role...</p>
      </section>
    )
  }

  if (error || !role) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">
          {error ?? "Role tidak ditemukan."}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(baseUrl)}
        >
          Kembali ke daftar role
        </Button>
      </section>
    )
  }

  return (
    <FormRole
      mode="edit"
      roleId={role.id}
      initialData={{
        title: role.title,
        description: role.description,
      }}
    />
  )
}
