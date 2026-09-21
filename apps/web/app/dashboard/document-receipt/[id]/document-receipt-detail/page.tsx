"use client"

import { useParams } from "next/navigation"
import { TableDataDocumentReceiptDetail } from "@/features/document-receipt-detail/components"

export default function DocumentReceiptDetailListPage() {
  const params = useParams<{ id: string }>()

  return <TableDataDocumentReceiptDetail documentReceiptId={params?.id} />
}
