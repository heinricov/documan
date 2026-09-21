"use client"

import { useParams } from "next/navigation"
import { useDocumentReceipt } from "@/features/document-receipt/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"
import { TableDataDocumentReceiptDetail } from "@/features/document-receipt-detail/components"

const config: EntityFormConfig = {
  entityName: "Document Receipt",
  entityNamePlural: "Document Receipts",
  baseUrl: ROUTES.documentReceipt,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {},
  updateFn: async () => {},
  fields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Deskripsi" },
    { name: "userId", label: "User ID" },
    { name: "docTypeId", label: "Doc Type ID" },
    { name: "subsidiaryId", label: "Subsidiary ID" },
    { name: "partnerId", label: "Partner ID" },
    { name: "boxId", label: "Box ID" },
  ],
}

export default function ViewDocumentReceiptPage() {
  const params = useParams<{ id: string }>()
  const { documentReceipt, isLoading, error } = useDocumentReceipt(params?.id)

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat document receipt...</p>
      </section>
    )
  }

  if (error || !documentReceipt) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "Document receipt tidak ditemukan."}</p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <EntityForm
        config={config}
        mode="view"
        entityId={documentReceipt.id}
        initialData={documentReceipt}
      />

      <TableDataDocumentReceiptDetail documentReceiptId={documentReceipt.id} />
    </div>
  )
}
