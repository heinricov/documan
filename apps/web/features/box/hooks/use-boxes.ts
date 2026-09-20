"use client"

import { useCallback } from "react"
import type { Box } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseBoxesResult = { boxes: Box[]; deleteBox: (box: Box) => Promise<void> } & Pick<ReturnType<typeof useEntityList<Box>>, "isLoading" | "error">

export function useBoxes(): UseBoxesResult {
  const listGetter = useCallback(() => api.resources.boxes.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.boxes.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "box")
  return { boxes: items, deleteBox: removeItem, ...rest }
}
