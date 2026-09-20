"use client"

import { useCallback } from "react"
import type { Box } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseBoxResult = { box: Box | null } & Pick<ReturnType<typeof useEntityItem<Box>>, "isLoading" | "error">

export function useBox(id: string | undefined): UseBoxResult {
  const getter = useCallback((boxId: string) => api.resources.boxes.get(boxId), [])
  const { item, ...rest } = useEntityItem(id, getter, "box")
  return { box: item, ...rest }
}
