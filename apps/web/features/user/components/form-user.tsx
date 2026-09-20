"use client"

import { FieldInput } from "@packages/ui/form/field-input"
import {
  CreateUserSchema,
  UpdateUserSchema,
  type User,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { useRoleTitleMap } from "@/lib/hooks"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

export type FormUserMode = "create" | "edit"

export interface FormUserProps {
  mode?: FormUserMode
  userId?: string
  initialData?: Pick<User, "username" | "email" | "roleId">
}

export function FormUser({ mode = "create", userId, initialData }: FormUserProps) {
  const isEdit = mode === "edit"
  const { roles } = useRoleTitleMap()

  const config: EntityFormConfig = {
    entityName: "User",
    entityNamePlural: "Users",
    baseUrl: ROUTES.user,
    createSchema: CreateUserSchema,
    updateSchema: UpdateUserSchema,
    createFn: (data) => api.resources.users.create(data as { username: string; email: string; password: string; roleId: string }),
    updateFn: (id, data) => api.resources.users.update(id, data as { username?: string; email?: string; password?: string; roleId?: string }),
    fields: [
      {
        name: "username",
        label: "Username",
        description: "Username unik (case-insensitive)",
        placeholder: "cth. johndoe",
        required: true,
      },
      {
        name: "email",
        type: "email",
        label: "Email",
        description: "Email unik untuk login",
        placeholder: "cth. john@example.com",
        required: true,
      },
      {
        name: "roleId",
        render: "select",
        label: "Role",
        description: "Pilih role untuk user ini",
        placeholder: "Pilih role...",
        required: true,
        options: roles.map((role) => ({
          label: role.title,
          value: role.id,
        })),
      },
    ],
    extraFields: !isEdit ? (
      <FieldInput
        name="password"
        type="password"
        label="Password"
        description="Minimal 8 karakter"
        placeholder="Masukkan password"
        required
      />
    ) : undefined,
    extractData: (formData) => {
      const username = (formData.get("username") as string)?.trim() ?? ""
      const email = (formData.get("email") as string)?.trim() ?? ""
      const password = (formData.get("password") as string) ?? ""
      const roleId = (formData.get("roleId") as string) ?? ""
      return {
        username,
        email,
        ...(isEdit ? {} : { password }),
        roleId,
      }
    },
  }

  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={userId}
      initialData={initialData}
    />
  )
}
