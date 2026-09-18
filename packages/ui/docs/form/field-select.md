# FieldSelect

Komponen select field tingkat tinggi yang sudah dilengkapi label, description, icon, error, required indicator, dan dukungan options fleksibel.

Lokasi: `@packages/ui/form/field-select`

Dibangun di atas `Select` dari `@packages/ui/components/select` (base-ui).

---

## Import

```tsx
import { FieldSelect } from "@packages/ui/form/field-select"
```

---

## Props

| Prop            | Tipe                              | Default              | Keterangan                                                         |
| --------------- | --------------------------------- | -------------------- | ------------------------------------------------------------------ |
| `label`         | `string`                          | `"Label Select"`     | Label field                                                        |
| `description`   | `string`                          | -                    | Teks bantuan di bawah select                                       |
| `placeholder`   | `string`                          | `"Pilih opsi..."`    | Placeholder saat belum ada yang dipilih                             |
| `emptyMessage`  | `string`                          | `"Tidak ada opsi tersedia."` | Pesan saat options kosong                                  |
| `options`       | `Option[]`                        | `[]`                 | Daftar opsi. `Option = string \| { label: string; value: string }` |
| `icon`          | `ReactNode \| null`               | -                    | Icon opsional di bawah select                                      |
| `error`         | `string \| string[]`              | -                    | Menampilkan pesan error                                            |
| `required`      | `boolean`                         | `false`              | Menampilkan tanda `*` pada label                                   |
| `disabled`      | `boolean`                         | `false`              | Nonaktifkan field                                                  |
| `id`            | `string`                          | auto (`useId`)       | Custom id (opsional)                                               |
| `name`          | `string`                          | -                    | Nama field (untuk FormData)                                        |
| `value`         | `string`                          | -                    | Controlled value                                                   |
| `defaultValue`  | `string`                          | -                    | Uncontrolled default value                                         |
| `onValueChange` | `(value: string \| null) => void` | -                    | Callback saat value berubah                                        |
| `className`     | `string`                          | -                    | Custom class pada select trigger                                   |

Semua props native `Select` (base-ui) juga didukung dan di-forward.

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
- **Auto label display**: `SelectValue` otomatis menampilkan label (bukan raw value) berkat `items` mapping
- **Icon opsional**: Bisa ditambahkan atau dihilangkan (`icon={null}`)
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

> **Note**: Saat dipilih, `SelectValue` akan menampilkan `label` ("Administrator"), bukan `value` ("admin").

### 3. Required + Description

```tsx
<FieldSelect
  name="role"
  label="Role"
  description="Pilih role yang sesuai dengan tanggung jawab user"
  required
  options={[
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
  ]}
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
      options={[
        { label: "Next.js", value: "nextjs" },
        { label: "SvelteKit", value: "sveltekit" },
        { label: "Nuxt.js", value: "nuxt" },
      ]}
      description={value ? `Terpilih: ${value}` : "Belum ada yang dipilih"}
    />
  )
}
```

### 6. Uncontrolled dengan defaultValue

```tsx
<FieldSelect
  name="role"
  label="Role"
  defaultValue="editor"
  options={[
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
    { label: "Viewer", value: "viewer" },
  ]}
/>
```

### 7. Disabled

```tsx
<FieldSelect
  name="role"
  label="Role"
  disabled
  defaultValue="editor"
  options={["admin", "editor", "viewer"]}
/>
```

### 8. Custom Empty Message

```tsx
<FieldSelect
  name="framework"
  label="Framework"
  options={[]}
  emptyMessage="Framework tidak ditemukan."
  placeholder="Cari framework..."
/>
```

### 9. Dengan Icon

```tsx
import { Shield } from "lucide-react"

<FieldSelect
  name="role"
  label="Role"
  icon={<Shield className="size-4" />}
  options={[
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
  ]}
/>
```

### 10. Di dalam FieldLayout

```tsx
"use client"

import { useState } from "react"
import { FieldLayout, FieldSetGroup } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldSelect } from "@packages/ui/form/field-select"

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [errors, setErrors] = useState<{
    title?: string
    roleId?: string
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
        const roleId = selectedRole

        const newErrors: typeof errors = {}
        if (!title) newErrors.title = "Nama wajib diisi"
        if (!roleId) newErrors.roleId = "Role wajib dipilih"

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        setErrors({})
        // submit...
      }}
    >
      <FieldSetGroup
        legend="Buat User Baru"
        description="Lengkapi data di bawah ini"
      >
        <FieldInput
          name="title"
          label="Nama"
          required
          error={errors.title}
        />

        <FieldSelect
          name="roleId"
          label="Role"
          description="Pilih role untuk user"
          required
          options={[
            { label: "Administrator", value: "admin" },
            { label: "Editor", value: "editor" },
            { label: "Viewer", value: "viewer" },
          ]}
          value={selectedRole}
          onValueChange={(val) => setSelectedRole(val ?? "")}
          placeholder="Pilih role"
          error={errors.roleId}
        />
      </FieldSetGroup>
    </FieldLayout>
  )
}
```

---

## Perbedaan dengan Combobox (sebelumnya)

Komponen ini sebelumnya menggunakan `Combobox` dari `@packages/ui/components/combobox`. Saat ini menggunakan `Select` dari `@packages/ui/components/select`.

| Aspek | Combobox (lama) | Select (baru) |
|-------|-----------------|---------------|
| Tipe dropdown | Searchable (bisa ketik) | Klik untuk pilih |
| Value display | Perlu manual `getLabel()` | Otomatis via `items` prop |
| Form submission | Perlu hidden input manual | Hidden input otomatis dari base-ui |
| UI | Input + dropdown | Trigger + popup |

---

## Catatan

- Komponen ini dibangun di atas `Field` + `Select` dari `@packages/ui/components`.
- `items` prop di `SelectRoot` memastikan `SelectValue` menampilkan **label** bukan **value**.
- `options` menerima `string[]` atau `{ label: string; value: string }[]`.
- Saat menggunakan object options, yang dikirim sebagai form value adalah `value`, sementara yang ditampilkan adalah `label`.
- Untuk form submission via `FormData`, pastikan prop `name` diberikan.
- Saat `error` diberikan, field menampilkan state invalid (`aria-invalid` + styling error).
- Untuk controlled mode, gunakan `value` + `onValueChange`.
- Untuk uncontrolled mode, gunakan `defaultValue`.
