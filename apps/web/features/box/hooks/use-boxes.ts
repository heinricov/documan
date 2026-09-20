"use client"

import { useEffect, useState } from "react"
import type { Box } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseBoxesResult {
  boxes: Box[]
  isLoading: boolean
  error: string | null
  deleteBox: (box: Box) => Promise<void>
}

export function useBoxes(): UseBoxesResult {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBoxes() {
      try {
        const data = await api.resources.boxes.list({ limit: 100 })
        if (active) setBoxes(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadBoxes()

    return () => {
      active = false
    }
  }, [])

  async function deleteBox(box: Box) {
    await api.resources.boxes.remove(box.id)
    setBoxes((prev) => prev.filter((item) => item.id !== box.id))
  }

  return { boxes, isLoading, error, deleteBox }
}
