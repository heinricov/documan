"use client"

import { useState } from "react"

import { FieldLayout } from "@packages/ui/form/field-layout"
import { FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

import { toast } from "@packages/ui/components/toast"

export default function Page() {
  // id toast terakhir: dibaca ulang oleh tombol "Batal" (form) & aksi toast
  const [lastToastId, setLastToastId] = useState<string | null>(null)

  return (
    <FieldLayout
      buttonLabel="Simpan Role"
      cancelLabel="Batal"
      cancelOnclick={() => {
        // tutup toast tersimpan terakhir (jika ada) via id yang dicatat
        if (lastToastId) toast.close(lastToastId)
        setLastToastId(null)
      }}
      onSubmit={(event) => {
        event.preventDefault()
        // idiomatik & reusable: BACA semula input bernama via FormData —
        // mendukung controlled konvensional & berbagai type (text, email, dst)

        // toast: dipanggil di EVENT HANDLER (BUKAN di render) → tampil benar;
        // pakai actionProps untuk aksi Undo yang menutup toast & batalkan role
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
      }}
    >
      <FieldSetLayout
        legend="Input Roles"
        description="Demo idiomatic — uncontrolled (`FormData`) + berbagai type input, cukup reusable dipakai di mana saja"
      >
        <FieldInput
          name="title"
          type="text"
          label="Nama Role"
          description="Nama unik role (case-insensitive)"
          placeholder="cth. Editor"
        />
        <FieldInput
          name="email"
          type="email"
          label="Email Kontak"
          description="Untuk notifikasi yang berkaitan dengan role ini"
          placeholder="cth. admin@perusahaan.id"
        />
        <FieldTextArea
          name="description"
          label="Deskripsi Role"
          description="Penjelasan singkat peran ini"
          placeholder="cth. Mengelola dokumen organisasi"
        />
      </FieldSetLayout>
    </FieldLayout>
  )
}