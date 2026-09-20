"use client"

import { useCallback } from "react"
import type { Partner } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UsePartnersResult = { partners: Partner[]; deletePartner: (partner: Partner) => Promise<void> } & Pick<ReturnType<typeof useEntityList<Partner>>, "isLoading" | "error">

export function usePartners(): UsePartnersResult {
  const listGetter = useCallback(() => api.resources.partners.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.partners.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "partner")
  return { partners: items, deletePartner: removeItem, ...rest }
}
