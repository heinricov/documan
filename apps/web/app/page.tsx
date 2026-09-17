"use client"

import { useState } from "react"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { FieldSelect } from "@packages/ui/form/field-select"
import { FieldDate } from "@packages/ui/form/field-date"
import { toast } from "@packages/ui/components/toast"
import { FaEnvelope } from "react-icons/fa"

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastToastId, setLastToastId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | string[] | undefined>()
  const [errors, setErrors] = useState<{
    title?: string
    email?: string | string[]
    role?: string
    dueDate?: string
    description?: string
  }>({})
  const [dueDate, setDueDate] = useState<Date | undefined>()

  return (
    <FieldLayout
      buttonLabel="Simpan Role"
      cancelLabel="Batal"
      isLoading={isLoading}
      error={formError}
      cancelOnclick={() => {
        if (lastToastId) toast.close(lastToastId)
        setLastToastId(null)
        setErrors({})
        setFormError(undefined)
      }}
      onSubmit={async (event) => {
        event.preventDefault()
        setFormError(undefined)

        const formData = new FormData(event.currentTarget)
        const title = (formData.get("title") as string)?.trim()
        const email = (formData.get("email") as string)?.trim()
        const role = (formData.get("role") as string)?.trim()
        const description = (formData.get("description") as string)?.trim()

        const newErrors: typeof errors = {}

        if (!title || title.length < 3) {
          newErrors.title = "Nama role minimal 3 karakter"
        }
        if (!email) {
          newErrors.email = "Email wajib diisi"
        } else if (!email.includes("@")) {
          newErrors.email = ["Format email tidak valid"]
        }
        if (!role) {
          newErrors.role = "Role wajib dipilih"
        }
        if (!dueDate) newErrors.dueDate = "Tanggal jatuh tempo wajib diisi"
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
          dueDate: dueDate?.toISOString(),
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
        legend="Input Roles"
        description="Contoh penggunaan FieldLayout, FieldInput, FieldSelect, dan FieldTextArea"
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

        <FieldInput
          name="email"
          type="email"
          label="Email Kontak"
          description="Untuk notifikasi yang berkaitan dengan role ini"
          placeholder="cth. admin@perusahaan.id"
          icon={<FaEnvelope />}
          required
          error={errors.email}
        />

        <FieldSelect
          name="role"
          label="Tipe Role"
          description="Pilih tipe role"
          required
          options={[
            { label: "Administrator", value: "admin" },
            { label: "Editor", value: "editor" },
            { label: "Viewer", value: "viewer" },
          ]}
          placeholder="Pilih tipe role"
          error={errors.role}
        />

        <FieldDate
          name="dueDate"
          label="Tanggal Jatuh Tempo"
          description="Batas waktu penyelesaian dokumen"
          required
          value={dueDate}
          onValueChange={setDueDate}
          error={errors.dueDate}
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
