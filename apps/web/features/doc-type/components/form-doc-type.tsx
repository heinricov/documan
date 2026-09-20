"use client"

import {
  CreateDocTypeSchema,
  UpdateDocTypeSchema,
  type DocType,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Doc Type",
  entityNamePlural: "Doc Types",
  baseUrl: ROUTES.docType,
  createSchema: CreateDocTypeSchema,
  updateSchema: UpdateDocTypeSchema,
  createFn: (data) => api.resources.docTypes.create(data as { title: string; description?: string | null }),
  updateFn: (id, data) => api.resources.docTypes.update(id, data as { title?: string; description?: string | null }),
  fields: [
    {
      name: "title",
      label: "Title",
      description: "Singkatan atau kode doc type (unik)",
      placeholder: "cth. do, pv, si",
      required: true,
    },
    {
      name: "description",
      label: "Deskripsi",
      description: "Penjelasan singkat doc type ini (opsional)",
      placeholder: "cth. Delivery Order, Payment Voucher",
      render: "textarea",
      maxLength: 200,
    },
  ],
}

export type FormDocTypeMode = "create" | "edit"

export interface FormDocTypeProps {
  mode?: FormDocTypeMode
  docTypeId?: string
  initialData?: Pick<DocType, "title" | "description">
}

export function FormDocType({ mode, docTypeId, initialData }: FormDocTypeProps) {
  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={docTypeId}
      initialData={initialData}
    />
  )
}
