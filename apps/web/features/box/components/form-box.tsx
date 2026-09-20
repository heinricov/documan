"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"
import { CreateBoxSchema, UpdateBoxSchema, type Box } from "@packages/validator"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.box

export type FormBoxMode = "create" | "edit"

export interface FormBoxProps {
  mode?: FormBoxMode
  boxId?: string
  initialData?: Pick<Box, "noBox" | "title" | "description">
}

export function FormBox({ mode = "create", boxId, initialData }: FormBoxProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    noBox?: string
    title?: string
    description?: string
  }>({})

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update Box" : "Add Box"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const noBox = (formData.get("noBox") as string)?.trim() ?? ""
          const rawTitle = (formData.get("title") as string)?.trim()
          const title = rawTitle && rawTitle.length > 0 ? rawTitle : null
          const rawDescription = (formData.get("description") as string)?.trim()
          const description =
            rawDescription && rawDescription.length > 0 ? rawDescription : null

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdateBoxSchema : CreateBoxSchema
          const parsed = schema.safeParse({ noBox, title, description })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (key === "noBox" || key === "title" || key === "description") {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !boxId) {
            setFormError("ID box tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && boxId) {
              await api.resources.boxes.update(boxId, parsed.data)
              toast.add({
                type: "success",
                title: "Box diperbarui",
                description: `Box "${noBox}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.boxes.create(
                parsed.data as {
                  noBox: string
                  title?: string | null
                  description?: string | null
                }
              )
              toast.add({
                type: "success",
                title: "Box tersimpan",
                description: `Box "${noBox}" berhasil dibuat.`,
              })
            }

            router.push(baseUrl)
            router.refresh()
          } catch (error) {
            setFormError(getErrorMessage(error))
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <FieldSetGroup
          legend={isEdit ? "Edit Box" : "Boxes"}
          description={
            isEdit
              ? "Perbarui data box di bawah ini"
              : "Anda bisa menambahkan box baru di sini"
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <FieldInput
            name="noBox"
            type="text"
            label="No Box"
            description="Nomor box (unik)"
            placeholder="cth. BOX-001"
            required
            defaultValue={initialData?.noBox ?? ""}
            disabled={isLoading}
            error={errors.noBox}
          />

          <FieldInput
            name="title"
            type="text"
            label="Title"
            description="Judul box (opsional)"
            placeholder="cth. Arsip Dokumen 2026"
            defaultValue={initialData?.title ?? ""}
            disabled={isLoading}
            error={errors.title}
          />

          <FieldTextArea
            name="description"
            label="Deskripsi"
            description="Penjelasan singkat box ini (opsional)"
            placeholder="cth. Box untuk arsip dokumen tahun 2026"
            defaultValue={initialData?.description ?? ""}
            disabled={isLoading}
            maxLength={200}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.description}
            </p>
          ) : null}
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}
