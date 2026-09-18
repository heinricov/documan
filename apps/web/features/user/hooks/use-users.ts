"use client"

import { useEffect, useState } from "react"
import type { User } from "@packages/validator"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"

export interface UseUsersResult {
  users: User[]
  isLoading: boolean
  error: string | null
  deleteUser: (user: User) => Promise<void>
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadUsers() {
      try {
        const data = await api.resources.users.list({ limit: 100 })
        if (active) setUsers(data)
      } catch (err) {
        if (active)
          setError(getErrorMessage(err, "Tidak dapat terhubung ke server."))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadUsers()

    return () => {
      active = false
    }
  }, [])

  async function deleteUser(user: User) {
    await api.resources.users.remove(user.id)
    setUsers((prev) => prev.filter((item) => item.id !== user.id))
  }

  return { users, isLoading, error, deleteUser }
}
