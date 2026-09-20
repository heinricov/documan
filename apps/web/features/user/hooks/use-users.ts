"use client"

import { useCallback } from "react"
import type { User } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseUsersResult = { users: User[]; deleteUser: (user: User) => Promise<void> } & Pick<ReturnType<typeof useEntityList<User>>, "isLoading" | "error">

export function useUsers(): UseUsersResult {
  const listGetter = useCallback(() => api.resources.users.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.users.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "user")
  return { users: items, deleteUser: removeItem, ...rest }
}
