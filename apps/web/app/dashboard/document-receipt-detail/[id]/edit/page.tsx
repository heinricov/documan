"use client"

import { useParams } from "next/navigation"
import { useDocumentReceiptDetail } from "@/features/document-receipt-detail/hooks"
import { FormDocumentReceiptDetail } from "@/features/document-receipt-detail/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditDocumentReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const { item, isLoading, error } = useDocumentReceiptDetail(params?.id)

  const config: EntityEditPageConfig = {
    item,
    isLoading,
    error,
    entityName: "document receipt detail",
    baseUrl: ROUTES.documentReceiptDetail,
    children: item ? (
      <FormDocumentReceiptDetail
        mode="edit"
        documentReceiptDetailId={item.id}
        initialData={{
          documentReceiptId: item.documentReceiptId,
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
