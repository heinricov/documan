"use client"

import { useCallback } from "react"
import type { DocType } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseDocTypesResult = { docTypes: DocType[]; deleteDocType: (docType: DocType) => Promise<void> } & Pick<ReturnType<typeof useEntityList<DocType>>, "isLoading" | "error">

export function useDocTypes(): UseDocTypesResult {
  const listGetter = useCallback(() => api.resources.docTypes.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.docTypes.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "doc type")
  return { docTypes: items, deleteDocType: removeItem, ...rest }
}
