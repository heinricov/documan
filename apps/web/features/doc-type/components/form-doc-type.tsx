"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"
import {
  CreateDocTypeSchema,
  UpdateDocTypeSchema,
  type DocType,
} from "@packages/validator"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.docType

export type FormDocTypeMode = "create" | "edit"

export interface FormDocTypeProps {
  mode?: FormDocTypeMode
  docTypeId?: string
  initialData?: Pick<DocType, "title" | "description">
}

export function FormDocType({
  mode = "create",
  docTypeId,
  initialData,
}: FormDocTypeProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
  }>({})

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update Doc Type" : "Add Doc Type"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const title = (formData.get("title") as string)?.trim() ?? ""
          const rawDescription = (formData.get("description") as string)?.trim()
          const description =
            rawDescription && rawDescription.length > 0 ? rawDescription : null

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdateDocTypeSchema : CreateDocTypeSchema
          const parsed = schema.safeParse({ title, description })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (key === "title" || key === "description") {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !docTypeId) {
            setFormError("ID doc type tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && docTypeId) {
              await api.resources.docTypes.update(docTypeId, parsed.data)
              toast.add({
                type: "success",
                title: "Doc Type diperbarui",
                description: `Doc Type "${title}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.docTypes.create(
                parsed.data as { title: string; description?: string | null }
              )
              toast.add({
                type: "success",
                title: "Doc Type tersimpan",
                description: `Doc Type "${title}" berhasil dibuat.`,
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
          legend={isEdit ? "Edit Doc Type" : "Doc Types"}
          description={
            isEdit
              ? "Perbarui data doc type di bawah ini"
              : "Anda bisa menambahkan doc type baru di sini"
          }
        >
          {formError ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <FieldInput
            name="title"
            type="text"
            label="Title"
            description="Singkatan atau kode doc type (unik)"
            placeholder="cth. do, pv, si"
            required
            defaultValue={initialData?.title ?? ""}
            disabled={isLoading}
            error={errors.title}
          />

          <FieldTextArea
            name="description"
            label="Deskripsi"
            description="Penjelasan singkat doc type ini (opsional)"
            placeholder="cth. Delivery Order, Payment Voucher"
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