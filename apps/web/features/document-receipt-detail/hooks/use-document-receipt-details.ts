"use client"

import { useCallback } from "react"
import type { DocumentReceiptDetail } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseDocumentReceiptDetailsResult = {
  items: DocumentReceiptDetail[]
  deleteItem: (item: DocumentReceiptDetail) => Promise<void>
} & Pick<ReturnType<typeof useEntityList<DocumentReceiptDetail>>, "isLoading" | "error">

export function useDocumentReceiptDetails(): UseDocumentReceiptDetailsResult {
  const listGetter = useCallback(
    () => api.resources.documentReceiptDetails.list({ limit: 100 }),
    []
  )
  const removeGetter = useCallback(
    (id: string) => api.resources.documentReceiptDetails.remove(id),
    []
  )
  const { items, removeItem, ...rest } = useEntityList(
    listGetter,
    removeGetter,
    "document-receipt-detail"
  )
  return { items, deleteItem: removeItem, ...rest }
}
