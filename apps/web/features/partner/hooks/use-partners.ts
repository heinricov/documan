"use client"

import { useEffect, useState } from "react"
import type { Partner } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UsePartnersResult {
  partners: Partner[]
  isLoading: boolean
  error: string | null
  deletePartner: (partner: Partner) => Promise<void>
}

export function usePartners(): UsePartnersResult {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPartners() {
      try {
        const data = await api.resources.partners.list({ limit: 100 })
        if (active) setPartners(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadPartners()

    return () => {
      active = false
    }
  }, [])

  async function deletePartner(partner: Partner) {
    await api.resources.partners.remove(partner.id)
    setPartners((prev) => prev.filter((item) => item.id !== partner.id))
  }

  return { partners, isLoading, error, deletePartner }
}