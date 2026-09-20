"use client"

import { useCallback } from "react"
import type { User } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseUserResult = { user: User | null } & Pick<ReturnType<typeof useEntityItem<User>>, "isLoading" | "error">

export function useUser(id: string | undefined): UseUserResult {
  const getter = useCallback((userId: string) => api.resources.users.get(userId), [])
  const { item, ...rest } = useEntityItem(id, getter, "user")
  return { user: item, ...rest }
}
