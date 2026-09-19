"use client"

import { useEffect, useState } from "react"
import type { DocType } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseDocTypesResult {
  docTypes: DocType[]
  isLoading: boolean
  error: string | null
  deleteDocType: (docType: DocType) => Promise<void>
}

export function useDocTypes(): UseDocTypesResult {
  const [docTypes, setDocTypes] = useState<DocType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadDocTypes() {
      try {
        const data = await api.resources.docTypes.list({ limit: 100 })
        if (active) setDocTypes(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadDocTypes()

    return () => {
      active = false
    }
  }, [])

  async function deleteDocType(docType: DocType) {
    await api.resources.docTypes.remove(docType.id)
    setDocTypes((prev) => prev.filter((item) => item.id !== docType.id))
  }

  return { docTypes, isLoading, error, deleteDocType }
}