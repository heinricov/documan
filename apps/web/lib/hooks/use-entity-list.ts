"use client"

import { useEffect, useRef, useState } from "react"
import { getErrorMessage } from "@/lib/errors"

export interface UseEntityListResult<T> {
  items: T[]
  isLoading: boolean
  error: string | null
  removeItem: (item: T) => Promise<void>
}

export function useEntityList<T extends { id: string }>(
  listGetter: () => Promise<T[]>,
  removeGetter: (id: string) => Promise<unknown>,
  entityName: string
): UseEntityListResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const listGetterRef = useRef(listGetter)
  const removeGetterRef = useRef(removeGetter)
  listGetterRef.current = listGetter
  removeGetterRef.current = removeGetter

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await listGetterRef.current()
        if (active) setItems(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [entityName])

  async function removeItem(item: T) {
    await removeGetterRef.current(item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return { items, isLoading, error, removeItem }
}
