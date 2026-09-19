"use client"

import { useEffect, useState } from "react"
import type { DocType } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseDocTypeResult {
  docType: DocType | null
  isLoading: boolean
  error: string | null
}

export function useDocType(id: string | undefined): UseDocTypeResult {
  const [docType, setDocType] = useState<DocType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) {
        if (active) {
          setError("ID doc type tidak valid.")
          setIsLoading(false)
        }
        return
      }

      try {
        const data = await api.resources.docTypes.get(id as string)
        if (active) setDocType(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat doc type."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { docType, isLoading, error }
}