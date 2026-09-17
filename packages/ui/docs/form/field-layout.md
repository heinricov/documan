# FieldLayout & FieldSetLayout

Komponen layout form tingkat tinggi untuk membungkus field-field dan menampilkan tombol aksi (Submit / Cancel).

Lokasi: `@packages/ui/form/field-layout`

---

## FieldLayout

### Import

```tsx
import { FieldLayout } from "@packages/ui/form/field-layout"
```

### Props

| Prop            | Tipe                 | Default    | Keterangan                                                                 |
| --------------- | -------------------- | ---------- | -------------------------------------------------------------------------- |
| `buttonLabel`   | `string`             | `"Submit"` | Teks tombol submit                                                         |
| `cancelLabel`   | `string`             | `"Cancel"` | Teks tombol batal                                                          |
| `cancelOnclick` | `MouseEventHandler`  | -          | Handler tombol batal. Jika tidak diberikan, tombol batal tidak ditampilkan |
| `isLoading`     | `boolean`            | `false`    | Menonaktifkan tombol dan mengubah teks submit menjadi `"Menyimpan..."`     |
| `disabled`      | `boolean`            | `false`    | Menonaktifkan seluruh tombol                                               |
| `error`         | `string \| string[]` | -          | Error di level form (ditampilkan di atas tombol)                           |
| `onSubmit`      | `FormEventHandler`   | -          | Handler saat form di-submit                                                |
| `className`     | `string`             | -          | Custom class pada wrapper                                                  |
| `children`      | `ReactNode`          | -          | Isi form (biasanya `FieldSetLayout` + field-field)                         |

Semua props native `<form>` juga didukung.

### Contoh Dasar

```tsx
<FieldLayout
  buttonLabel="Simpan"
  onSubmit={(e) => {
    e.preventDefault()
    // handle submit
  }}
>
  {/* field-field di sini */}
</FieldLayout>
```

### Dengan Tombol Batal

```tsx
<FieldLayout
  buttonLabel="Simpan Role"
  cancelLabel="Batal"
  cancelOnclick={() => {
    // reset form / tutup modal
  }}
  onSubmit={(e) => {
    e.preventDefault()
  }}
>
  {/* ... */}
</FieldLayout>
```

### Loading State

```tsx
const [isLoading, setIsLoading] = useState(false)

<FieldLayout
  buttonLabel="Simpan"
  isLoading={isLoading}
  onSubmit={async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // await api call
    } finally {
      setIsLoading(false)
    }
  }}
>
  {/* ... */}
</FieldLayout>
```

### Disabled

```tsx
<FieldLayout
  buttonLabel="Simpan"
  disabled
  onSubmit={(e) => e.preventDefault()}
>
  {/* ... */}
</FieldLayout>
```

### Form-level Error

```tsx
// String
<FieldLayout
  buttonLabel="Simpan"
  error="Terjadi kesalahan saat menyimpan data"
  onSubmit={(e) => e.preventDefault()}
>
  {/* ... */}
</FieldLayout>

// Array
<FieldLayout
  buttonLabel="Simpan"
  error={["Gagal terhubung ke server", "Silakan coba lagi nanti"]}
  onSubmit={(e) => e.preventDefault()}
>
  {/* ... */}
</FieldLayout>
```

---

## FieldSetLayout

Komponen pembungkus sekelompok field dengan legend dan description.

### Import

```tsx
import { FieldSetLayout } from "@packages/ui/form/field-layout"
```

### Props

| Prop          | Tipe        | Default            | Keterangan                |
| ------------- | ----------- | ------------------ | ------------------------- |
| `legend`      | `string`    | `"Label FieldSet"` | Judul fieldset            |
| `description` | `string`    | -                  | Deskripsi di bawah legend |
| `className`   | `string`    | -                  | Custom class              |
| `children`    | `ReactNode` | -                  | Isi fieldset              |

Semua props native `<fieldset>` juga didukung.

### Contoh

```tsx
<FieldSetLayout
  legend="Informasi Role"
  description="Lengkapi data role di bawah ini"
>
  <FieldInput name="title" label="Nama Role" />
  <FieldTextArea name="description" label="Deskripsi" />
</FieldSetLayout>
```

---

## Contoh Lengkap

```tsx
"use client"

import { useState } from "react"
import { FieldLayout, FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

export default function Example() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()

  return (
    <FieldLayout
      buttonLabel="Simpan Role"
      cancelLabel="Batal"
      isLoading={isLoading}
      error={formError}
      cancelOnclick={() => {
        setFormError(undefined)
      }}
      onSubmit={async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
          // API call
        } catch {
          setFormError("Gagal menyimpan data")
        } finally {
          setIsLoading(false)
        }
      }}
    >
      <FieldSetLayout
        legend="Input Roles"
        description="Lengkapi data di bawah ini"
      >
        <FieldInput name="title" label="Nama Role" required />
        <FieldTextArea name="description" label="Deskripsi" required />
      </FieldSetLayout>
    </FieldLayout>
  )
}
```
