"use client"

import { useEffect, useState } from "react"
import type { Role } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseRolesResult {
  roles: Role[]
  isLoading: boolean
  error: string | null
  deleteRole: (role: Role) => Promise<void>
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadRoles() {
      try {
        const data = await api.resources.roles.list({ limit: 100 })
        if (active) setRoles(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadRoles()

    return () => {
      active = false
    }
  }, [])

  async function deleteRole(role: Role) {
    await api.resources.roles.remove(role.id)
    setRoles((prev) => prev.filter((item) => item.id !== role.id))
  }

  return { roles, isLoading, error, deleteRole }
}
