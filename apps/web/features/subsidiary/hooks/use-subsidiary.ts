"use client"

import { useCallback } from "react"
import type { Subsidiary } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseSubsidiaryResult = { subsidiary: Subsidiary | null } & Pick<ReturnType<typeof useEntityItem<Subsidiary>>, "isLoading" | "error">

export function useSubsidiary(id: string | undefined): UseSubsidiaryResult {
  const getter = useCallback((subsidiaryId: string) => api.resources.subsidiaries.get(subsidiaryId), [])
  const { item, ...rest } = useEntityItem(id, getter, "subsidiary")
  return { subsidiary: item, ...rest }
}
