"use client"

import { useParams } from "next/navigation"
import { useRole } from "@/features/role/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Role",
  entityNamePlural: "Roles",
  baseUrl: ROUTES.role,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "title", label: "Nama" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewRolePage() {
  const params = useParams<{ id: string }>()
  const { role, isLoading, error } = useRole(params?.id)

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
        <p className="text-sm text-destructive">{error ?? "Role tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={role.id}
      initialData={role}
    />
  )
}
