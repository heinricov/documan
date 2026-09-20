"use client"

import { useCallback } from "react"
import type { DocType } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseDocTypeResult = { docType: DocType | null } & Pick<ReturnType<typeof useEntityItem<DocType>>, "isLoading" | "error">

export function useDocType(id: string | undefined): UseDocTypeResult {
  const getter = useCallback((docTypeId: string) => api.resources.docTypes.get(docTypeId), [])
  const { item, ...rest } = useEntityItem(id, getter, "doc type")
  return { docType: item, ...rest }
}
