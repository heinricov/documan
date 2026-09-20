"use client"

import { useEffect, useState } from "react"
import type { Box } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseBoxResult {
  box: Box | null
  isLoading: boolean
  error: string | null
}

export function useBox(id: string | undefined): UseBoxResult {
  const [box, setBox] = useState<Box | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) {
        if (active) {
          setError("ID box tidak valid.")
          setIsLoading(false)
        }
        return
      }

      try {
        const data = await api.resources.boxes.get(id as string)
        if (active) setBox(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat box."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { box, isLoading, error }
}
