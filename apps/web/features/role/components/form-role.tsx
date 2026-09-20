"use client"

import {
  CreateRoleSchema,
  UpdateRoleSchema,
  type Role,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Role",
  entityNamePlural: "Roles",
  baseUrl: ROUTES.role,
  createSchema: CreateRoleSchema,
  updateSchema: UpdateRoleSchema,
  createFn: (data) => api.resources.roles.create(data as { title: string; description?: string | null }),
  updateFn: (id, data) => api.resources.roles.update(id, data as { title?: string; description?: string | null }),
  fields: [
    {
      name: "title",
      label: "Nama Role",
      description: "Nama unik role (case-insensitive)",
      placeholder: "cth. Editor",
      required: true,
    },
    {
      name: "description",
      label: "Deskripsi Role",
      description: "Penjelasan singkat peran ini (opsional)",
      placeholder: "cth. Mengelola dokumen organisasi",
      render: "textarea",
      maxLength: 200,
    },
  ],
}

export type FormRoleMode = "create" | "edit"

export interface FormRoleProps {
  mode?: FormRoleMode
  roleId?: string
  initialData?: Pick<Role, "title" | "description">
}

export function FormRole({ mode, roleId, initialData }: FormRoleProps) {
  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={roleId}
      initialData={initialData}
    />
  )
}
