"use client"

import { useCallback } from "react"
import type { Subsidiary } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseSubsidiariesResult = { subsidiaries: Subsidiary[]; deleteSubsidiary: (subsidiary: Subsidiary) => Promise<void> } & Pick<ReturnType<typeof useEntityList<Subsidiary>>, "isLoading" | "error">

export function useSubsidiaries(): UseSubsidiariesResult {
  const listGetter = useCallback(() => api.resources.subsidiaries.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.subsidiaries.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "subsidiary")
  return { subsidiaries: items, deleteSubsidiary: removeItem, ...rest }
}
