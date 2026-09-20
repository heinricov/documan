"use client"

import { useCallback } from "react"
import type { DocumentReceipt } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseDocumentReceiptsResult = {
  documentReceipts: DocumentReceipt[]
  deleteDocumentReceipt: (item: DocumentReceipt) => Promise<void>
} & Pick<ReturnType<typeof useEntityList<DocumentReceipt>>, "isLoading" | "error">

export function useDocumentReceipts(): UseDocumentReceiptsResult {
  const listGetter = useCallback(
    () => api.resources.documentReceipts.list({ limit: 100 }),
    []
  )
  const removeGetter = useCallback(
    (id: string) => api.resources.documentReceipts.remove(id),
    []
  )
  const { items, removeItem, ...rest } = useEntityList(
    listGetter,
    removeGetter,
    "document-receipt"
  )
  return { documentReceipts: items, deleteDocumentReceipt: removeItem, ...rest }
}
