# FieldDate

Komponen date picker tingkat tinggi yang sudah dilengkapi label, description, error, required indicator, dan dukungan controlled/uncontrolled.

Lokasi: `@packages/ui/form/field-date`

Dibangun di atas `Popover` + `Calendar` + `Button` dari `@packages/ui/components`.

---

## Import

```tsx
import { FieldDate } from "@packages/ui/form/field-date"
```

---

## Props

| Prop            | Tipe                                | Default           | Keterangan                                               |
| --------------- | ----------------------------------- | ----------------- | -------------------------------------------------------- |
| `label`         | `string`                            | `"Label Date"`    | Label field                                              |
| `description`   | `string`                            | -                 | Teks bantuan di bawah field                              |
| `placeholder`   | `string`                            | `"Pilih tanggal"` | Teks saat belum ada tanggal dipilih                      |
| `error`         | `string \| string[]`                | -                 | Menampilkan pesan error                                  |
| `required`      | `boolean`                           | `false`           | Menampilkan tanda `*` pada label                         |
| `disabled`      | `boolean`                           | `false`           | Nonaktifkan field                                        |
| `id`            | `string`                            | auto (`useId`)    | Custom id (opsional)                                     |
| `name`          | `string`                            | -                 | Nama field (untuk FormData, disimpan sebagai ISO string) |
| `value`         | `Date`                              | -                 | Controlled value                                         |
| `defaultValue`  | `Date`                              | -                 | Uncontrolled default value                               |
| `onValueChange` | `(date: Date \| undefined) => void` | -                 | Callback saat tanggal berubah                            |
| `dateFormat`    | `string`                            | `"PPP"`           | Format tampilan (mengikuti `date-fns`)                   |
| `className`     | `string`                            | -                 | Custom class pada tombol trigger                         |

---

## Fitur

- **Date picker** berbasis Popover + Calendar
- **Aksesibilitas**: `useId()`, `aria-describedby`, `aria-invalid`, `aria-required`
- **Error handling**: Mendukung string tunggal atau array pesan error
- **Required indicator**: Tanda `*` otomatis saat `required={true}`
- **Controlled & Uncontrolled**: Mendukung kedua mode
- **Hidden input**: Otomatis menyimpan nilai ISO string jika `name` diberikan (untuk FormData)
- **Custom format**: Menggunakan `date-fns` format string

---

## Contoh Penggunaan

### 1. Dasar

```tsx
<FieldDate
  name="birthDate"
  label="Tanggal Lahir"
  placeholder="Pilih tanggal lahir"
/>
```

### 2. Dengan Description

```tsx
<FieldDate
  name="startDate"
  label="Tanggal Mulai"
  description="Tanggal mulai berlaku dokumen"
  placeholder="Pilih tanggal"
/>
```

### 3. Required

```tsx
<FieldDate
  name="dueDate"
  label="Tanggal Jatuh Tempo"
  required
  placeholder="Pilih tanggal"
/>
```

### 4. Dengan Error

```tsx
// String
<FieldDate
  name="dueDate"
  label="Tanggal Jatuh Tempo"
  error="Tanggal wajib diisi"
/>

// Array
<FieldDate
  name="dueDate"
  label="Tanggal Jatuh Tempo"
  error={["Tanggal tidak valid", "Tidak boleh di masa lalu"]}
/>
```

### 5. Controlled

```tsx
"use client"

import { useState } from "react"
import { FieldDate } from "@packages/ui/form/field-date"

export function ExampleControlled() {
  const [date, setDate] = useState<Date | undefined>()

  return (
    <FieldDate
      name="meetingDate"
      label="Tanggal Meeting"
      value={date}
      onValueChange={setDate}
      description={
        date ? `Terpilih: ${date.toLocaleDateString("id-ID")}` : "Belum dipilih"
      }
    />
  )
}
```

### 6. Default Value (Uncontrolled)

```tsx
<FieldDate
  name="startDate"
  label="Tanggal Mulai"
  defaultValue={new Date()}
/>
```

### 7. Disabled

```tsx
<FieldDate
  name="lockedDate"
  label="Tanggal Terkunci"
  disabled
  defaultValue={new Date("2025-01-01")}
/>
```

### 8. Custom Format

```tsx
<FieldDate
  name="eventDate"
  label="Tanggal Event"
  dateFormat="dd MMM yyyy"
  placeholder="Pilih tanggal"
/>
```

### 9. Di dalam FieldLayout

```tsx
"use client"

import { useState } from "react"
import { FieldLayout, FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldDate } from "@packages/ui/form/field-date"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

export default function Page() {
  const [errors, setErrors] = useState<{
    title?: string
    dueDate?: string
    description?: string
  }>({})
  const [dueDate, setDueDate] = useState<Date | undefined>()

  return (
    <FieldLayout
      buttonLabel="Simpan"
      cancelLabel="Batal"
      cancelOnclick={() => {
        setErrors({})
        setDueDate(undefined)
      }}
      onSubmit={(e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const title = (formData.get("title") as string)?.trim()
        const description = (formData.get("description") as string)?.trim()

        const newErrors: typeof errors = {}
        if (!title) newErrors.title = "Judul wajib diisi"
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
        // submit...
      }}
    >
      <FieldSetLayout
        legend="Buat Dokumen"
        description="Lengkapi data di bawah ini"
      >
        <FieldInput
          name="title"
          label="Judul Dokumen"
          required
          error={errors.title}
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

- Membutuhkan dependency `date-fns` (`format`).
- Membutuhkan komponen `Calendar`, `Popover`, `PopoverContent`, `PopoverTrigger`, dan `Button`.
- Nilai yang dikirim via `FormData` (jika `name` diberikan) berupa **ISO string** (`date.toISOString()`).
- Format default `"PPP"` menghasilkan tampilan seperti `April 29th, 2025`. Gunakan format `date-fns` lain sesuai kebutuhan (contoh: `"dd/MM/yyyy"`, `"dd MMM yyyy"`).
- Saat `error` diberikan, field menampilkan state invalid.
