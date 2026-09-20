"use client"

import { useParams } from "next/navigation"
import { useBox } from "@/features/box/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Box",
  entityNamePlural: "Boxes",
  baseUrl: ROUTES.box,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "noBox", label: "No Box" },
    { name: "title", label: "Title" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewBoxPage() {
  const params = useParams<{ id: string }>()
  const { box, isLoading, error } = useBox(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat box...</p>
      </section>
    )
  }

  if (error || !box) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Box tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={box.id}
      initialData={box}
    />
  )
}
