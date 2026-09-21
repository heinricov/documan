"use client"

import { useParams } from "next/navigation"
import { FormDocumentReceiptDetail } from "@/features/document-receipt-detail/components"

export default function AddDocumentReceiptDetailPage() {
  const params = useParams<{ id: string }>()

  return (
    <FormDocumentReceiptDetail
      mode="create"
      documentReceiptId={params?.id}
    />
  )
}
