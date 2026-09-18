"use client"

import { useEffect, useState } from "react"
import type { Role } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseRoleResult {
  role: Role | null
  isLoading: boolean
  error: string | null
}

export function useRole(id: string | undefined): UseRoleResult {
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("ID role tidak valid.")
      setIsLoading(false)
      return
    }

    let active = true

    async function load() {
      try {
        const data = await api.resources.roles.get(id as string)
        if (active) setRole(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat role."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { role, isLoading, error }
}
