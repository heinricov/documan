"use client"

import { useCallback } from "react"
import type { DocumentReceipt } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseDocumentReceiptResult = {
  documentReceipt: DocumentReceipt | null
} & Pick<ReturnType<typeof useEntityItem<DocumentReceipt>>, "isLoading" | "error">

export function useDocumentReceipt(id: string | undefined): UseDocumentReceiptResult {
  const getter = useCallback(
    (itemId: string) => api.resources.documentReceipts.get(itemId),
    []
  )
  const { item, ...rest } = useEntityItem(id, getter, "document-receipt")
  return { documentReceipt: item, ...rest }
}
