"use client"

import { useEffect, useState } from "react"
import type { Subsidiary } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseSubsidiaryResult {
  subsidiary: Subsidiary | null
  isLoading: boolean
  error: string | null
}

export function useSubsidiary(id: string | undefined): UseSubsidiaryResult {
  const [subsidiary, setSubsidiary] = useState<Subsidiary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("ID subsidiary tidak valid.")
      setIsLoading(false)
      return
    }

    let active = true

    async function load() {
      try {
        const data = await api.resources.subsidiaries.get(id as string)
        if (active) setSubsidiary(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat subsidiary."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { subsidiary, isLoading, error }
}