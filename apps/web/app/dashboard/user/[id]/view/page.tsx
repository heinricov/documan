"use client"

import { useParams } from "next/navigation"
import { Shield } from "lucide-react"
import { useUser } from "@/features/user/hooks"
import { useRoleTitleMap } from "@/lib/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

export default function ViewUserPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading, error } = useUser(params?.id)
  const { getRoleTitle } = useRoleTitleMap()

  if (isLoading) {
    return (
      <section className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
        <p className="text-sm text-muted-foreground">Memuat user...</p>
      </section>
    )
  }

  if (error || !user) {
    return (
      <section className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background px-4 py-10">
        <p className="text-sm text-destructive">{error ?? "User tidak ditemukan."}</p>
      </section>
    )
  }

  const config: EntityFormConfig = {
    entityName: "User",
    entityNamePlural: "Users",
    baseUrl: ROUTES.user,
    createSchema: { safeParse: () => ({ success: true }) },
    updateSchema: { safeParse: () => ({ success: true }) },
    createFn: async () => {},
    updateFn: async () => {},
    fields: [
      { name: "username", label: "Username" },
      { name: "email", label: "Email" },
      {
        name: "roleId",
        label: "Role",
        customRender: () => (
          <div className="flex items-center gap-2">
            <div className="mt-0.5 rounded-md border bg-muted/40 p-1">
              <Shield className="size-3 text-muted-foreground" aria-hidden="true" />
            </div>
            {getRoleTitle(user.roleId)}
          </div>
        ),
      },
    ],
  }

  return (
    <EntityForm
      config={config}
      mode="view"
      entityId={user.id}
      initialData={user}
    />
  )
}
