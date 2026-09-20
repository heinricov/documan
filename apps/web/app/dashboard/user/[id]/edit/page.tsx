"use client"

import { useParams } from "next/navigation"
import { useUser } from "@/features/user/hooks"
import { FormUser } from "@/features/user/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading, error } = useUser(params?.id)

  const config: EntityEditPageConfig = {
    item: user,
    isLoading,
    error,
    entityName: "user",
    baseUrl: ROUTES.user,
    children: user ? (
      <FormUser mode="edit" userId={user.id} initialData={{ username: user.username, email: user.email, roleId: user.roleId }} />
    ) : null,
  }

  return <EntityEditPage config={config} />
}
