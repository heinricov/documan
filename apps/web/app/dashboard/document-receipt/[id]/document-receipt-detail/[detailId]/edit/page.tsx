"use client"

import { useParams } from "next/navigation"
import { useDocumentReceiptDetail } from "@/features/document-receipt-detail/hooks"
import { FormDocumentReceiptDetail } from "@/features/document-receipt-detail/components"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditDocumentReceiptDetailPage() {
  const params = useParams<{ id: string; detailId: string }>()
  const { item, isLoading, error } = useDocumentReceiptDetail(params?.detailId)

  const config: EntityEditPageConfig = {
    item,
    isLoading,
    error,
    entityName: "document receipt detail",
    baseUrl: `/dashboard/document-receipt/${params?.id}/document-receipt-detail`,
    children: item ? (
      <FormDocumentReceiptDetail
        mode="edit"
        documentReceiptId={params?.id}
        documentReceiptDetailId={item.id}
        initialData={{
          docTypeId: item.docTypeId,
          subsidiaryId: item.subsidiaryId,
          partnerId: item.partnerId,
          nomorDoc: item.nomorDoc,
          nomorFaktur: item.nomorFaktur,
          nomorPl: item.nomorPl,
          nomorDo: item.nomorDo,
          nomorInv: item.nomorInv,
          nomorPv: item.nomorPv,
          nomorNota: item.nomorNota,
          description: item.description,
        }}
      />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
