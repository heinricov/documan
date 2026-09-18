"use client"

import { useEffect, useState } from "react"
import type { User } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseUserResult {
  user: User | null
  isLoading: boolean
  error: string | null
}

export function useUser(id: string | undefined): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("ID user tidak valid.")
      setIsLoading(false)
      return
    }

    let active = true

    async function load() {
      try {
        const data = await api.resources.users.get(id as string)
        if (active) setUser(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Gagal memuat user."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  return { user, isLoading, error }
}
