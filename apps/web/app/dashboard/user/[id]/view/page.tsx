"use client"

import { useParams } from "next/navigation"
import { Users, Shield } from "lucide-react"

import { useUser } from "@/features/user/hooks"
import { useRoleTitleMap } from "@/lib/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityDetailView, type EntityDetailViewConfig } from "@/components/entity"

export default function ViewUserPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading, error } = useUser(params?.id)
  const { getRoleTitle } = useRoleTitleMap()

  const roleTitle = user ? getRoleTitle(user.roleId) : ""

  const config: EntityDetailViewConfig = {
    item: user,
    isLoading,
    error,
    entityName: "user",
    icon: <Users className="size-4 text-muted-foreground" aria-hidden="true" />,
    baseUrl: ROUTES.user,
    titleField: "username",
    fields: [
      { label: "Username", value: user?.username },
      { label: "Email", value: user?.email },
      {
        label: "Role",
        value: (
          <div className="flex items-center gap-2">
            <div className="mt-0.5 rounded-md border bg-muted/40 p-1">
              <Shield className="size-3 text-muted-foreground" aria-hidden="true" />
            </div>
            {roleTitle}
          </div>
        ),
      },
    ],
  }

  return <EntityDetailView config={config} />
}
