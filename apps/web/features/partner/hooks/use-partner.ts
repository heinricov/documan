"use client"

import { useEffect, useState } from "react"
import type { Partner } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UsePartnerResult {
  partner: Partner | null
  isLoading: boolean
  error: string | null
}

export function usePartner(id: string | undefined): UsePartnerResult {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) {
        if (active) {
          setError("ID partner tidak valid.")
          setIsLoading(false)
        }
        return
      }

      try {
        const data = await api.resources.partners.get(id as string)
        if (active) setPartner(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat partner."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { partner, isLoading, error }
}