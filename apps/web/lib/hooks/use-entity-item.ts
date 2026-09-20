"use client"

import { useEffect, useRef, useState } from "react"
import { getErrorMessage } from "@/lib/errors"

export interface UseEntityItemResult<T> {
  item: T | null
  isLoading: boolean
  error: string | null
}

export function useEntityItem<T>(
  id: string | undefined,
  getter: (id: string) => Promise<T>,
  entityName: string
): UseEntityItemResult<T> {
  const [item, setItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const getterRef = useRef(getter)
  getterRef.current = getter

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) {
        if (active) {
          setError(`ID ${entityName} tidak valid.`)
          setIsLoading(false)
        }
        return
      }

      try {
        const data = await getterRef.current(id)
        if (active) setItem(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, `Gagal memuat ${entityName}.`))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id, entityName])

  return { item, isLoading, error }
}
