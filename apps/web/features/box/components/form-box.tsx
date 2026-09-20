"use client"

import {
  CreateBoxSchema,
  UpdateBoxSchema,
  type Box,
} from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Box",
  entityNamePlural: "Boxes",
  baseUrl: ROUTES.box,
  createSchema: CreateBoxSchema,
  updateSchema: UpdateBoxSchema,
  createFn: (data) =>
    api.resources.boxes.create(
      data as { noBox: string; title?: string | null; description?: string | null }
    ),
  updateFn: (id, data) => api.resources.boxes.update(id, data as { noBox?: string; title?: string | null; description?: string | null }),
  fields: [
    {
      name: "noBox",
      label: "No Box",
      description: "Nomor box (unik)",
      placeholder: "cth. BOX-001",
      required: true,
    },
    {
      name: "title",
      label: "Title",
      description: "Judul box (opsional)",
      placeholder: "cth. Arsip Dokumen 2026",
    },
    {
      name: "description",
      label: "Deskripsi",
      description: "Penjelasan singkat box ini (opsional)",
      placeholder: "cth. Box untuk arsip dokumen tahun 2026",
      render: "textarea",
      maxLength: 200,
    },
  ],
}

export type FormBoxMode = "create" | "edit"

export interface FormBoxProps {
  mode?: FormBoxMode
  boxId?: string
  initialData?: Pick<Box, "noBox" | "title" | "description">
}

export function FormBox({ mode, boxId, initialData }: FormBoxProps) {
  return (
    <EntityForm
      config={config}
      mode={mode}
      entityId={boxId}
      initialData={initialData}
    />
  )
}
