"use client"

import { useCallback } from "react"
import type { Partner } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UsePartnerResult = { partner: Partner | null } & Pick<ReturnType<typeof useEntityItem<Partner>>, "isLoading" | "error">

export function usePartner(id: string | undefined): UsePartnerResult {
  const getter = useCallback((partnerId: string) => api.resources.partners.get(partnerId), [])
  const { item, ...rest } = useEntityItem(id, getter, "partner")
  return { partner: item, ...rest }
}
