# FieldMultipleSelect

Komponen multi-select (chips) tingkat tinggi yang sudah dilengkapi label, description, error, required indicator, dan dukungan options fleksibel.

Lokasi: `@packages/ui/form/field-multiple-select`

Dibangun di atas `Combobox` (mode `multiple`) dari `@packages/ui/components/combobox`.

---

## Import

```tsx
import { FieldMultipleSelect } from "@packages/ui/form/field-multiple-select"
```

---

## Props

| Prop            | Tipe                        | Default                       | Keterangan                                                         |
| --------------- | --------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `label`         | `string`                    | `"Label Multiple Select"`     | Label field                                                        |
| `description`   | `string`                    | -                             | Teks bantuan di bawah select                                       |
| `placeholder`   | `string`                    | `"Pilih opsi..."`             | Placeholder pada input chips                                       |
| `emptyMessage`  | `string`                    | `"Tidak ada item ditemukan."` | Pesan saat tidak ada hasil filter                                  |
| `options`       | `Option[]`                  | `[]`                          | Daftar opsi. `Option = string \| { label: string; value: string }` |
| `error`         | `string \| string[]`        | -                             | Menampilkan pesan error                                            |
| `required`      | `boolean`                   | `false`                       | Menampilkan tanda `*` pada label                                   |
| `disabled`      | `boolean`                   | `false`                       | Nonaktifkan field                                                  |
| `id`            | `string`                    | auto (`useId`)                | Custom id (opsional)                                               |
| `name`          | `string`                    | -                             | Nama field (untuk FormData)                                        |
| `value`         | `string[]`                  | -                             | Controlled value (array)                                           |
| `defaultValue`  | `string[]`                  | -                             | Uncontrolled default value (array)                                 |
| `onValueChange` | `(value: string[]) => void` | -                             | Callback saat value berubah                                        |
| `className`     | `string`                    | -                             | Custom class pada chips container                                  |

---

## Tipe Option

```ts
type Option = string | { label: string; value: string }
```

- `string` → value dan label sama
- `{ label, value }` → label untuk tampilan chip, value untuk data

---

## Fitur

- **Multi selection** dengan tampilan chips
- **Aksesibilitas**: `useId()`, `aria-describedby`, `aria-invalid`, `aria-required`
- **Error handling**: Mendukung string tunggal atau array pesan error
- **Required indicator**: Tanda `*` otomatis saat `required={true}`
- **Options fleksibel**: Support `string[]` atau `{ label, value }[]`
- **Searchable**: Bisa diketik untuk filter opsi
- **Controlled & Uncontrolled**: Mendukung kedua mode

---

## Contoh Penggunaan

### 1. Dasar (string[])

```tsx
<FieldMultipleSelect
  name="frameworks"
  label="Framework"
  options={["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]}
  placeholder="Pilih framework"
/>
```

### 2. Object options (label + value)

```tsx
<FieldMultipleSelect
  name="roles"
  label="Roles"
  options={[
    { label: "Administrator", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ]}
  placeholder="Pilih roles"
/>
```

### 3. Required + Description

```tsx
<FieldMultipleSelect
  name="roles"
  label="Roles"
  description="Pilih satu atau lebih role"
  required
  options={["admin", "editor", "viewer"]}
/>
```

### 4. Dengan Error

```tsx
// String
<FieldMultipleSelect
  name="roles"
  label="Roles"
  error="Minimal pilih 1 role"
  options={["admin", "editor", "viewer"]}
/>

// Array
<FieldMultipleSelect
  name="roles"
  label="Roles"
  error={["Minimal pilih 1 role", "Role tidak valid"]}
  options={["admin", "editor", "viewer"]}
/>
```

### 5. Controlled

```tsx
"use client"

import { useState } from "react"
import { FieldMultipleSelect } from "@packages/ui/form/field-multiple-select"

export function ExampleControlled() {
  const [value, setValue] = useState<string[]>([])

  return (
    <FieldMultipleSelect
      name="frameworks"
      label="Framework"
      value={value}
      onValueChange={setValue}
      options={["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]}
      description={
        value.length > 0
          ? `Terpilih: ${value.join(", ")}`
          : "Belum ada yang dipilih"
      }
    />
  )
}
```

### 6. Default Value (Uncontrolled)

```tsx
<FieldMultipleSelect
  name="roles"
  label="Roles"
  defaultValue={["editor", "viewer"]}
  options={[
    { label: "Administrator", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ]}
/>
```

### 7. Disabled

```tsx
<FieldMultipleSelect
  name="roles"
  label="Roles"
  disabled
  defaultValue={["editor"]}
  options={["admin", "editor", "viewer"]}
/>
```

### 8. Custom Empty Message

```tsx
<FieldMultipleSelect
  name="frameworks"
  label="Framework"
  options={["Next.js", "SvelteKit"]}
  emptyMessage="Framework tidak ditemukan."
  placeholder="Cari framework..."
/>
```

### 9. Di dalam FieldLayout

```tsx
"use client"

import { useState } from "react"
import { FieldLayout, FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldMultipleSelect } from "@packages/ui/form/field-multiple-select"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

export default function Page() {
  const [errors, setErrors] = useState<{
    title?: string
    roles?: string
    description?: string
  }>({})
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  return (
    <FieldLayout
      buttonLabel="Simpan"
      cancelLabel="Batal"
      cancelOnclick={() => {
        setErrors({})
        setSelectedRoles([])
      }}
      onSubmit={(e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const title = (formData.get("title") as string)?.trim()
        const description = (formData.get("description") as string)?.trim()

        const newErrors: typeof errors = {}
        if (!title) newErrors.title = "Nama wajib diisi"
        if (selectedRoles.length === 0) {
          newErrors.roles = "Minimal pilih 1 role"
        }
        if (!description || description.length < 10) {
          newErrors.description = "Deskripsi minimal 10 karakter"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        setErrors({})
        console.log({ title, roles: selectedRoles, description })
        // submit...
      }}
    >
      <FieldSetLayout
        legend="Buat User"
        description="Lengkapi data di bawah ini"
      >
        <FieldInput
          name="title"
          label="Nama"
          required
          error={errors.title}
        />

        <FieldMultipleSelect
          name="roles"
          label="Roles"
          description="Pilih satu atau lebih role"
          required
          value={selectedRoles}
          onValueChange={setSelectedRoles}
          options={[
            { label: "Administrator", value: "admin" },
            { label: "Editor", value: "editor" },
            { label: "Viewer", value: "viewer" },
          ]}
          placeholder="Pilih roles"
          error={errors.roles}
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

- Komponen ini mengandalkan `@packages/ui/components/combobox` dengan dukungan `multiple`, `ComboboxChips`, `ComboboxChip`, `useComboboxAnchor`, dll.
- `value` dan `defaultValue` bertipe **`string[]`** (bukan string tunggal).
- `onValueChange` menerima `string[]`.
- Saat menggunakan object options, yang disimpan sebagai value adalah `value`, sementara yang ditampilkan di chip adalah `label`.
- Untuk validasi "minimal 1 item", lakukan pengecekan di `onSubmit` (karena multi-select tidak otomatis required oleh browser).
- Saat `error` diberikan, field menampilkan state invalid.
