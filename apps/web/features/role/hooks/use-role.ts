"use client"

import { useCallback } from "react"
import type { Role } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export type UseRoleResult = { role: Role | null } & Pick<ReturnType<typeof useEntityItem<Role>>, "isLoading" | "error">

export function useRole(id: string | undefined): UseRoleResult {
  const getter = useCallback((roleId: string) => api.resources.roles.get(roleId), [])
  const { item, ...rest } = useEntityItem(id, getter, "role")
  return { role: item, ...rest }
}
