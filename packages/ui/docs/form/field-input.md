# FieldInput

Komponen input field tingkat tinggi yang sudah dilengkapi label, description, icon, error, dan required indicator.

Lokasi: `@packages/ui/form/field-input`

---

## Import

```tsx
import { FieldInput } from "@packages/ui/form/field-input"
```

---

## Props

| Prop                 | Tipe                 | Default              | Keterangan                                              |
| -------------------- | -------------------- | -------------------- | ------------------------------------------------------- |
| `label`              | `string`             | `"Label Input"`      | Label field                                             |
| `description`        | `string`             | -                    | Teks bantuan di bawah input                             |
| `error`              | `string \| string[]` | -                    | Menampilkan pesan error                                 |
| `required`           | `boolean`            | `false`              | Menampilkan tanda `*` pada label                        |
| `icon`               | `ReactNode \| null`  | `<FaPencilAlt />`    | Icon di sisi kanan. Isi `null` untuk menghilangkan icon |
| `type`               | `string`             | `"text"`             | Tipe input (`text`, `email`, `password`, dll)           |
| `placeholder`        | `string`             | `"Field input here"` | Placeholder                                             |
| `id`                 | `string`             | auto (`useId`)       | Custom id (opsional)                                    |
| `disabled`           | `boolean`            | -                    | Nonaktifkan field                                       |
| `name`               | `string`             | -                    | Nama field (untuk FormData)                             |
| `value` / `onChange` | -                    | -                    | Controlled mode                                         |
| `className`          | `string`             | -                    | Custom class pada input                                 |
| `defaultValue`       | `string`             | -                    | Nilai default (uncontrolled)                            |

Semua props native `<input>` juga didukung dan di-forward.

---

## Fitur

- **Aksesibilitas**: `useId()`, `aria-describedby`, `aria-invalid`, `aria-required`
- **Error handling**: Mendukung string tunggal atau array pesan error
- **Required indicator**: Tanda `*` otomatis saat `required={true}`
- **Icon opsional**: Bisa diganti atau dihilangkan (`icon={null}`)
- **Controlled & Uncontrolled**: Mendukung kedua mode

---

## Contoh Penggunaan

### 1. Dasar

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  placeholder="cth. Editor"
/>
```

### 2. Dengan Description

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  description="Nama unik role (case-insensitive)"
  placeholder="cth. Editor"
/>
```

### 3. Required

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  required
  placeholder="Wajib diisi"
/>
```

### 4. Dengan Error (string)

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  error="Nama role sudah digunakan"
/>
```

### 5. Dengan Error (array)

```tsx
<FieldInput
  name="email"
  type="email"
  label="Email"
  error={["Format email tidak valid", "Email sudah terdaftar"]}
/>
```

### 6. Tanpa Icon

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  icon={null}
  placeholder="Tanpa icon"
/>
```

### 7. Custom Icon

```tsx
import { FaEnvelope } from "react-icons/fa"

<FieldInput
  name="email"
  type="email"
  label="Email Kontak"
  icon={<FaEnvelope />}
  placeholder="admin@perusahaan.id"
/>
```

### 8. Disabled

```tsx
<FieldInput
  name="title"
  label="Nama Role"
  disabled
  defaultValue="Tidak bisa diubah"
/>
```

### 9. Controlled

```tsx
"use client"

import { useState } from "react"
import { FieldInput } from "@packages/ui/form/field-input"

export function ExampleControlled() {
  const [value, setValue] = useState("")

  return (
    <FieldInput
      name="title"
      label="Nama Role"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      description={`Panjang: ${value.length} karakter`}
    />
  )
}
```

### 10. Berbagai Tipe Input

```tsx
{/* Text */}
<FieldInput name="title" type="text" label="Nama" />

{/* Email */}
<FieldInput name="email" type="email" label="Email" />

{/* Password */}
<FieldInput name="password" type="password" label="Password" />

{/* Number */}
<FieldInput name="age" type="number" label="Umur" />
```

---

## Catatan

- Komponen ini dibangun di atas `Field` + `InputGroup` dari `@packages/ui/components`.
- Icon default menggunakan `FaPencilAlt` dari `react-icons/fa`.
- Saat `error` diberikan, field akan menampilkan state invalid (border merah + `aria-invalid`).
