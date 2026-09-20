"use client"

import { useParams } from "next/navigation"
import { useDocType } from "@/features/doc-type/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Doc Type",
  entityNamePlural: "Doc Types",
  baseUrl: ROUTES.docType,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewDocTypePage() {
  const params = useParams<{ id: string }>()
  const { docType, isLoading, error } = useDocType(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat doc type...</p>
      </section>
    )
  }

  if (error || !docType) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Doc type tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={docType.id}
      initialData={docType}
    />
  )
}
