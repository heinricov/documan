"use client"

import { useEffect, useState } from "react"
import type { Subsidiary } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseSubsidiariesResult {
  subsidiaries: Subsidiary[]
  isLoading: boolean
  error: string | null
  deleteSubsidiary: (subsidiary: Subsidiary) => Promise<void>
}

export function useSubsidiaries(): UseSubsidiariesResult {
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSubsidiaries() {
      try {
        const data = await api.resources.subsidiaries.list({ limit: 100 })
        if (active) setSubsidiaries(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadSubsidiaries()

    return () => {
      active = false
    }
  }, [])

  async function deleteSubsidiary(subsidiary: Subsidiary) {
    await api.resources.subsidiaries.remove(subsidiary.id)
    setSubsidiaries((prev) => prev.filter((item) => item.id !== subsidiary.id))
  }

  return { subsidiaries, isLoading, error, deleteSubsidiary }
}