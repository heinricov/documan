# FieldSelect

Komponen select/combobox field tingkat tinggi yang sudah dilengkapi label, description, error, required indicator, dan dukungan options fleksibel.

Lokasi: `@packages/ui/form/field-select`

Dibangun di atas `Combobox` dari `@packages/ui/components/combobox`.

---

## Import

```tsx
import { FieldSelect } from "@packages/ui/form/field-select"
```

---

## Props

| Prop            | Tipe                              | Default                       | Keterangan                                                         |
| --------------- | --------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `label`         | `string`                          | `"Label Select"`              | Label field                                                        |
| `description`   | `string`                          | -                             | Teks bantuan di bawah select                                       |
| `placeholder`   | `string`                          | `"Pilih opsi..."`             | Placeholder pada input                                             |
| `emptyMessage`  | `string`                          | `"Tidak ada item ditemukan."` | Pesan saat tidak ada hasil filter                                  |
| `options`       | `Option[]`                        | `[]`                          | Daftar opsi. `Option = string \| { label: string; value: string }` |
| `error`         | `string \| string[]`              | -                             | Menampilkan pesan error                                            |
| `required`      | `boolean`                         | `false`                       | Menampilkan tanda `*` pada label                                   |
| `disabled`      | `boolean`                         | `false`                       | Nonaktifkan field                                                  |
| `id`            | `string`                          | auto (`useId`)                | Custom id (opsional)                                               |
| `name`          | `string`                          | -                             | Nama field (untuk FormData)                                        |
| `value`         | `string`                          | -                             | Controlled value                                                   |
| `defaultValue`  | `string`                          | -                             | Uncontrolled default value                                         |
| `onValueChange` | `(value: string \| null) => void` | -                             | Callback saat value berubah                                        |
| `className`     | `string`                          | -                             | Custom class pada input                                            |

---

## Tipe Option

```ts
type Option = string | { label: string; value: string }
```

- `string` → value dan label sama
- `{ label, value }` → label untuk tampilan, value untuk data

---

## Fitur

- **Aksesibilitas**: `useId()`, `aria-describedby`, `aria-invalid`, `aria-required`
- **Error handling**: Mendukung string tunggal atau array pesan error
- **Required indicator**: Tanda `*` otomatis saat `required={true}`
- **Options fleksibel**: Support `string[]` atau `{ label, value }[]`
- **Searchable**: Berbasis Combobox (bisa diketik untuk filter)
- **Controlled & Uncontrolled**: Mendukung kedua mode

---

## Contoh Penggunaan

### 1. Dasar (string[])

```tsx
<FieldSelect
  name="framework"
  label="Framework"
  options={["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]}
  placeholder="Pilih framework"
/>
```

### 2. Object options (label + value)

```tsx
<FieldSelect
  name="role"
  label="Role"
  options={[
    { label: "Administrator", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ]}
  placeholder="Pilih role"
/>
```

### 3. Required + Description

```tsx
<FieldSelect
  name="role"
  label="Role"
  description="Pilih role yang sesuai dengan tanggung jawab user"
  required
  options={["admin", "editor", "viewer"]}
/>
```

### 4. Dengan Error

```tsx
// String
<FieldSelect
  name="role"
  label="Role"
  error="Role wajib dipilih"
  options={["admin", "editor", "viewer"]}
/>

// Array
<FieldSelect
  name="role"
  label="Role"
  error={["Role tidak valid", "Silakan pilih dari daftar"]}
  options={["admin", "editor", "viewer"]}
/>
```

### 5. Controlled

```tsx
"use client"

import { useState } from "react"
import { FieldSelect } from "@packages/ui/form/field-select"

export function ExampleControlled() {
  const [value, setValue] = useState<string | undefined>()

  return (
    <FieldSelect
      name="framework"
      label="Framework"
      value={value}
      onValueChange={(val) => setValue(val ?? undefined)}
      options={["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]}
      description={value ? `Terpilih: ${value}` : "Belum ada yang dipilih"}
    />
  )
}
```

### 6. Disabled

```tsx
<FieldSelect
  name="role"
  label="Role"
  disabled
  defaultValue="editor"
  options={["admin", "editor", "viewer"]}
/>
```

### 7. Custom Empty Message

```tsx
<FieldSelect
  name="framework"
  label="Framework"
  options={["Next.js", "SvelteKit"]}
  emptyMessage="Framework tidak ditemukan."
  placeholder="Cari framework..."
/>
```

### 8. Di dalam FieldLayout

```tsx
"use client"

import { useState } from "react"
import { FieldLayout, FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldSelect } from "@packages/ui/form/field-select"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

export default function Page() {
  const [errors, setErrors] = useState<{
    title?: string
    role?: string
    description?: string
  }>({})

  return (
    <FieldLayout
      buttonLabel="Simpan"
      cancelLabel="Batal"
      cancelOnclick={() => setErrors({})}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const title = (formData.get("title") as string)?.trim()
        const role = (formData.get("role") as string)?.trim()
        const description = (formData.get("description") as string)?.trim()

        const newErrors: typeof errors = {}
        if (!title) newErrors.title = "Nama wajib diisi"
        if (!role) newErrors.role = "Role wajib dipilih"
        if (!description || description.length < 10) {
          newErrors.description = "Deskripsi minimal 10 karakter"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        setErrors({})
        // submit...
      }}
    >
      <FieldSetLayout
        legend="Buat Role Baru"
        description="Lengkapi data di bawah ini"
      >
        <FieldInput
          name="title"
          label="Nama Role"
          required
          error={errors.title}
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

        <FieldTextArea
          name="description"
          label="Deskripsi"
          required
          maxLength={200}
          showCounter
          error={errors.description}
        />
      </FieldSetLayout>
    </FieldLayout>
  )
}
```

---

## Catatan

- Komponen ini mengandalkan `@packages/ui/components/combobox`. Pastikan file tersebut sudah ada di project.
- `options` menerima `string[]` atau `{ label: string; value: string }[]`.
- Saat menggunakan object options, yang dikirim sebagai value adalah `value`, sementara yang ditampilkan adalah `label`.
- Untuk form submission via `FormData`, pastikan prop `name` diberikan.
- Saat `error` diberikan, field menampilkan state invalid (`aria-invalid` + styling error).
