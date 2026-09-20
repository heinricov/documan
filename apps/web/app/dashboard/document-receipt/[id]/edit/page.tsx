"use client"

import { useParams } from "next/navigation"
import { useDocumentReceipt } from "@/features/document-receipt/hooks"
import { FormDocumentReceipt } from "@/features/document-receipt/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditDocumentReceiptPage() {
  const params = useParams<{ id: string }>()
  const { documentReceipt, isLoading, error } = useDocumentReceipt(params?.id)

  const config: EntityEditPageConfig = {
    item: documentReceipt,
    isLoading,
    error,
    entityName: "document receipt",
    baseUrl: ROUTES.documentReceipt,
    children: documentReceipt ? (
      <FormDocumentReceipt
        mode="edit"
        documentReceiptId={documentReceipt.id}
        initialData={{
          title: documentReceipt.title,
          description: documentReceipt.description,
          userId: documentReceipt.userId,
          docTypeId: documentReceipt.docTypeId,
          boxId: documentReceipt.boxId,
        }}
      />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
