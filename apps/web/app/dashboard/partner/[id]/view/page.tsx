"use client"

import { useParams } from "next/navigation"
import { usePartner } from "@/features/partner/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Partner",
  entityNamePlural: "Partners",
  baseUrl: ROUTES.partner,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "name", label: "Nama" },
    { name: "type", label: "Tipe" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewPartnerPage() {
  const params = useParams<{ id: string }>()
  const { partner, isLoading, error } = usePartner(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat partner...</p>
      </section>
    )
  }

  if (error || !partner) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Partner tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={partner.id}
      initialData={partner}
    />
  )
}
