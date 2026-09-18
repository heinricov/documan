"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { toast } from "@packages/ui/components/toast"
import {
  CreateSubsidiarySchema,
  UpdateSubsidiarySchema,
  type Subsidiary,
} from "@packages/validator"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/constants"

const baseUrl = ROUTES.subsidiary

export type FormSubsidiaryMode = "create" | "edit"

export interface FormSubsidiaryProps {
  mode?: FormSubsidiaryMode
  subsidiaryId?: string
  initialData?: Pick<Subsidiary, "title" | "name" | "logo">
}

export function FormSubsidiary({
  mode = "create",
  subsidiaryId,
  initialData,
}: FormSubsidiaryProps) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [errors, setErrors] = useState<{
    title?: string
    name?: string
    logo?: string
  }>({})

  return (
    <section className="flex min-h-svh w-full justify-center bg-background px-4 py-10 text-foreground sm:py-16">
      <FieldLayout
        buttonLabel={
          isLoading ? "Menyimpan..." : isEdit ? "Update Subsidiary" : "Add Subsidiary"
        }
        cancelLabel="Batal"
        cancelOnclick={() => router.push(baseUrl)}
        onSubmit={async (event) => {
          event.preventDefault()
          setFormError(undefined)
          setErrors({})

          const formData = new FormData(event.currentTarget)
          const title = (formData.get("title") as string)?.trim() ?? ""
          const name = (formData.get("name") as string)?.trim() ?? ""
          const rawLogo = (formData.get("logo") as string)?.trim()
          const logo = rawLogo && rawLogo.length > 0 ? rawLogo : null

          // Validasi dengan SSOT dari @packages/validator
          const schema = isEdit ? UpdateSubsidiarySchema : CreateSubsidiarySchema
          const parsed = schema.safeParse({ title, name, logo })

          if (!parsed.success) {
            const fieldErrors: typeof errors = {}
            for (const issue of parsed.error.issues) {
              const key = issue.path[0]
              if (key === "title" || key === "name" || key === "logo") {
                fieldErrors[key] = issue.message
              }
            }
            setErrors(fieldErrors)
            return
          }

          if (isEdit && !subsidiaryId) {
            setFormError("ID subsidiary tidak valid.")
            return
          }

          setIsLoading(true)

          try {
            if (isEdit && subsidiaryId) {
              await api.resources.subsidiaries.update(subsidiaryId, parsed.data)
              toast.add({
                type: "success",
                title: "Subsidiary diperbarui",
                description: `Subsidiary "${title}" berhasil diperbarui.`,
              })
            } else {
              await api.resources.subsidiaries.create(
                parsed.data as { title: string; name: string; logo?: string | null }
              )
              toast.add({
                type: "success",
                title: "Subsidiary tersimpan",
                description: `Subsidiary "${title}" berhasil dibuat.`,
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
          legend={isEdit ? "Edit Subsidiary" : "Subsidiaries"}
          description={
            isEdit
              ? "Perbarui data subsidiary di bawah ini"
              : "Anda bisa menambahkan subsidiary baru di sini"
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
            description="Singkatan atau nama pendek subsidiary"
            placeholder="cth. PTMB"
            required
            defaultValue={initialData?.title ?? ""}
            disabled={isLoading}
            error={errors.title}
          />

          <FieldInput
            name="name"
            type="text"
            label="Nama Lengkap"
            description="Nama lengkap subsidiary"
            placeholder="cth. PT Maju Bersama"
            required
            defaultValue={initialData?.name ?? ""}
            disabled={isLoading}
            error={errors.name}
          />

          <FieldInput
            name="logo"
            type="text"
            label="Logo URL"
            description="URL logo subsidiary (opsional)"
            placeholder="cth. https://example.com/logo.png"
            defaultValue={initialData?.logo ?? ""}
            disabled={isLoading}
            error={errors.logo}
          />
        </FieldSetGroup>
      </FieldLayout>
    </section>
  )
}