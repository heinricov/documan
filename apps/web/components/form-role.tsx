"use client"

import { useState } from "react"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"
import { redirect } from "next/navigation"

export function FormRole() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastToastId, setLastToastId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | string[] | undefined>()
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
  }>({})

  return (
    <FieldLayout
      buttonLabel="Add Role"
      cancelLabel="Batal"
      isLoading={isLoading}
      error={formError}
      cancelOnclick={() => redirect("/role")}
      onSubmit={async (event) => {
        event.preventDefault()
        setFormError(undefined)

        const formData = new FormData(event.currentTarget)
        const title = (formData.get("title") as string)?.trim()
        const description = (formData.get("description") as string)?.trim()

        const newErrors: typeof errors = {}

        if (!title || title.length < 3) {
          newErrors.title = "Nama role minimal 3 karakter"
        }
        if (!description || description.length < 10) {
          newErrors.description = "Deskripsi minimal 10 karakter"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        setErrors({})
        console.log({
          title,
          description,
        })
        setIsLoading(true)

        try {
          // Simulasi API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const id = toast.add({
            title: "Role tersimpan",
            description: "Berhasil menyimpan role baru.",
            actionProps: {
              children: "Batal",
              onClick() {
                toast.close(id)
                setLastToastId(null)
              },
            },
          })
          setLastToastId(id)
        } catch {
          setFormError("Gagal menyimpan role. Silakan coba lagi.")
        } finally {
          setIsLoading(false)
        }
      }}
    >
      <FieldSetGroup
        legend="Roles"
        description="Anda bisa menambahkan role baru di sini"
      >
        <FieldInput
          name="title"
          type="text"
          label="Nama Role"
          description="Nama unik role (case-insensitive)"
          placeholder="cth. Editor"
          required
          error={errors.title}
        />
        <FieldTextArea
          name="description"
          label="Deskripsi Role"
          description="Penjelasan singkat peran ini"
          placeholder="cth. Mengelola dokumen organisasi"
          required
          maxLength={200}
          showCounter
          error={errors.description}
        />
      </FieldSetGroup>
    </FieldLayout>
  )
}
