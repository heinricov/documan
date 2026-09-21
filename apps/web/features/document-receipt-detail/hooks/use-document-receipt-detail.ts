"use client"

import { useCallback } from "react"
import type { DocumentReceiptDetail } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseDocumentReceiptDetailResult = {
  item: DocumentReceiptDetail | null
} & Pick<ReturnType<typeof useEntityItem<DocumentReceiptDetail>>, "isLoading" | "error">

export function useDocumentReceiptDetail(id: string | undefined): UseDocumentReceiptDetailResult {
  const getter = useCallback(
    (itemId: string) => api.resources.documentReceiptDetails.get(itemId),
    []
  )
  const { item, ...rest } = useEntityItem(id, getter, "document-receipt-detail")
  return { item, ...rest }
}
