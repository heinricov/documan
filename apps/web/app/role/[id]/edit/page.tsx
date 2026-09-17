"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ApiError, NetworkError } from "@packages/client"
import type { Role } from "@packages/validator"
import { Button } from "@packages/ui/components/button"

import { FormRole } from "@/components/form-role"
import { baseUrl } from "@/components/table-role"
import { api } from "@/lib/api"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof NetworkError) return "Tidak dapat terhubung ke server."
  if (error instanceof Error) return error.message
  return "Gagal memuat role."
}

export default function EditRolePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const roleId = params?.id

  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleId) {
      setError("ID role tidak valid.")
      setIsLoading(false)
      return
    }

    let active = true

    async function load() {
      try {
        const data = await api.resources.roles.get(roleId)
        if (active) setRole(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [roleId])

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
