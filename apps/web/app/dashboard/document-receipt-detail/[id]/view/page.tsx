"use client"

import { useParams } from "next/navigation"
import { useDocumentReceiptDetail } from "@/features/document-receipt-detail/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Document Receipt Detail",
  entityNamePlural: "Document Receipt Details",
  baseUrl: ROUTES.documentReceiptDetail,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "documentReceiptId", label: "Document Receipt ID" },
    { name: "docTypeId", label: "Doc Type ID" },
    { name: "subsidiaryId", label: "Subsidiary ID" },
    { name: "partnerId", label: "Partner ID" },
    { name: "nomorDoc", label: "Nomor Dokumen" },
    { name: "nomorFaktur", label: "Nomor Faktur" },
    { name: "nomorPl", label: "Nomor PL" },
    { name: "nomorDo", label: "Nomor DO" },
    { name: "nomorInv", label: "Nomor Invoice" },
    { name: "nomorPv", label: "Nomor PV" },
    { name: "nomorNota", label: "Nomor Nota" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewDocumentReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const { item, isLoading, error } = useDocumentReceiptDetail(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat document receipt detail...</p>
      </section>
    )
  }

  if (error || !item) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Document receipt detail tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={item.id}
      initialData={item}
    />
  )
}
