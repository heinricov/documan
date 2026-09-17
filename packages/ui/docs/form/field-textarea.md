# FieldTextArea

Komponen textarea field tingkat tinggi yang sudah dilengkapi label, description, error, required indicator, dan character counter opsional.

Lokasi: `@packages/ui/form/field-textarea`

---

## Import

```tsx
import { FieldTextArea } from "@packages/ui/form/field-textarea"
```

---

## Props

| Prop                 | Tipe                 | Default                   | Keterangan                                                |
| -------------------- | -------------------- | ------------------------- | --------------------------------------------------------- |
| `label`              | `string`             | `"Label Input text area"` | Label field                                               |
| `description`        | `string`             | -                         | Teks bantuan di bawah textarea                            |
| `error`              | `string \| string[]` | -                         | Menampilkan pesan error                                   |
| `required`           | `boolean`            | `false`                   | Menampilkan tanda `*` pada label                          |
| `maxLength`          | `number`             | -                         | Batas maksimal karakter                                   |
| `showCounter`        | `boolean`            | `false`                   | Menampilkan info batas karakter (membutuhkan `maxLength`) |
| `placeholder`        | `string`             | `"Field text area here"`  | Placeholder                                               |
| `id`                 | `string`             | auto (`useId`)            | Custom id (opsional)                                      |
| `disabled`           | `boolean`            | -                         | Nonaktifkan field                                         |
| `name`               | `string`             | -                         | Nama field (untuk FormData)                               |
| `value` / `onChange` | -                    | -                         | Controlled mode                                           |
| `className`          | `string`             | -                         | Custom class pada textarea                                |
| `defaultValue`       | `string`             | -                         | Nilai default (uncontrolled)                              |

Semua props native `<textarea>` juga didukung dan di-forward.

---

## Fitur

- **Aksesibilitas**: `useId()`, `aria-describedby`, `aria-invalid`, `aria-required`
- **Error handling**: Mendukung string tunggal atau array pesan error
- **Required indicator**: Tanda `*` otomatis saat `required={true}`
- **Character counter**: Opsional via `showCounter` + `maxLength`
- **Controlled & Uncontrolled**: Mendukung kedua mode

---

## Contoh Penggunaan

### 1. Dasar

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  placeholder="Tulis deskripsi di sini..."
/>
```

### 2. Dengan Description

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi Role"
  description="Penjelasan singkat mengenai tanggung jawab role ini"
  placeholder="cth. Mengelola dokumen organisasi"
/>
```

### 3. Required

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  required
  placeholder="Wajib diisi"
/>
```

### 4. Dengan Error (string)

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  error="Deskripsi minimal 10 karakter"
/>
```

### 5. Dengan Error (array)

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  error={["Deskripsi terlalu pendek", "Tidak boleh mengandung kata kasar"]}
/>
```

### 6. MaxLength + Counter

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi Singkat"
  maxLength={120}
  showCounter
  placeholder="Maksimal 120 karakter"
/>
```

### 7. Disabled

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  disabled
  defaultValue="Tidak bisa diubah"
/>
```

### 8. Controlled

```tsx
"use client"

import { useState } from "react"
import { FieldTextArea } from "@packages/ui/form/field-textarea"

export function ExampleControlled() {
  const [value, setValue] = useState("")

  return (
    <FieldTextArea
      name="description"
      label="Deskripsi"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLength={200}
      showCounter
      description={`Panjang saat ini: ${value.length} karakter`}
    />
  )
}
```

### 9. Uncontrolled dengan defaultValue

```tsx
<FieldTextArea
  name="description"
  label="Deskripsi"
  defaultValue="Nilai awal textarea"
  maxLength={300}
  showCounter
/>
```

---

## Catatan

- Komponen ini dibangun di atas `Field` + `InputGroup` dari `@packages/ui/components`.
- Character counter hanya muncul jika `showCounter={true}` **dan** `maxLength` diberikan.
- Saat ini counter menampilkan teks statis `"Max {maxLength} characters"`. Untuk counter real-time (sisa karakter), gunakan controlled mode + hitung manual di `description` atau state.
- Saat `error` diberikan, field akan menampilkan state invalid (border merah + `aria-invalid`).
