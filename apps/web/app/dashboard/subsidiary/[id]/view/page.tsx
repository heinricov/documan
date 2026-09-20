"use client"

import { useParams } from "next/navigation"
import { useSubsidiary } from "@/features/subsidiary/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Subsidiary",
  entityNamePlural: "Subsidiaries",
  baseUrl: ROUTES.subsidiary,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "title", label: "Title" },
    { name: "name", label: "Nama Lengkap" },
    {
      name: "logo",
      label: "Logo",
      customRender: (value) => {
        const logo = value as string | null
        if (!logo?.trim()) return "—"
        return (
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded border object-contain" />
            <span className="font-mono text-xs break-all">{logo}</span>
          </div>
        )
      },
    },
  ],
}

export default function ViewSubsidiaryPage() {
  const params = useParams<{ id: string }>()
  const { subsidiary, isLoading, error } = useSubsidiary(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat subsidiary...</p>
      </section>
    )
  }

  if (error || !subsidiary) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Subsidiary tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={subsidiary.id}
      initialData={subsidiary}
    />
  )
}
