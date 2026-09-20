"use client"

import { useEffect, useMemo, useState } from "react"
import type { Role } from "@packages/validator"
import { api } from "@/lib/api"

export interface UseRoleTitleMapResult {
  roles: Role[]
  /** Map roleId → role title */
  roleMap: Map<string, string>
  /** Get role title by roleId, fallback ke roleId sendiri */
  getRoleTitle: (roleId: string) => string
  isLoading: boolean
}

export function useRoleTitleMap(): UseRoleTitleMapResult {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await api.resources.roles.list({ limit: 100 })
        if (active) setRoles(data)
      } catch {
        // silently fail
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const roleMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of roles) map.set(r.id, r.title)
    return map
  }, [roles])

  const getRoleTitle = useMemo(() => {
    return (roleId: string) => roleMap.get(roleId) ?? roleId
  }, [roleMap])

  return { roles, roleMap, getRoleTitle, isLoading }
}
