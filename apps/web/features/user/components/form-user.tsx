"use client"

import { useState } from "react"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldSelect } from "@packages/ui/form/field-select"
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
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialData?.roleId ?? ""
  )

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
    ],
    extraFields: (
      <>
        {!isEdit && (
          <FieldInput
            name="password"
            type="password"
            label="Password"
            description="Minimal 8 karakter"
            placeholder="Masukkan password"
            required
          />
        )}

        <FieldSelect
          name="roleId"
          label="Role"
          description="Pilih role untuk user ini"
          placeholder="Pilih role..."
          emptyMessage="Tidak ada role tersedia."
          options={roles.map((role) => ({
            label: role.title,
            value: role.id,
          }))}
          value={selectedRoleId}
          onValueChange={(val) => setSelectedRoleId(val ?? "")}
          required
        />
      </>
    ),
    extractData: (formData) => {
      const username = (formData.get("username") as string)?.trim() ?? ""
      const email = (formData.get("email") as string)?.trim() ?? ""
      const password = (formData.get("password") as string) ?? ""
      const roleId = selectedRoleId
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
