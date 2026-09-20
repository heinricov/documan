"use client"

import { useCallback } from "react"
import type { Role } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityList } from "@/lib/hooks"

export type UseRolesResult = { roles: Role[]; deleteRole: (role: Role) => Promise<void> } & Pick<ReturnType<typeof useEntityList<Role>>, "isLoading" | "error">

export function useRoles(): UseRolesResult {
  const listGetter = useCallback(() => api.resources.roles.list({ limit: 100 }), [])
  const removeGetter = useCallback((id: string) => api.resources.roles.remove(id), [])
  const { items, removeItem, ...rest } = useEntityList(listGetter, removeGetter, "role")
  return { roles: items, deleteRole: removeItem, ...rest }
}
