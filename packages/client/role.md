# Roles Resource — Panduan Penggunaan

Dokumentasi lengkap cara menggunakan resource **roles** dari `@packages/client`.

Resource ini berkomunikasi dengan endpoint CRUD `/roles` di `apps/api`.

---

## Daftar Isi

- [Persiapan](#persiapan)
- [Tipe Data](#tipe-data)
- [Method](#method)
  - [list](#list)
  - [get](#get)
  - [create](#create)
  - [update](#update)
  - [remove](#remove)
- [Contoh Integrasi dengan Form](#contoh-integrasi-dengan-form)
- [Error yang Umum Muncul](#error-yang-umum-muncul)
- [Tips](#tips)

---

## Persiapan

```ts
// apps/web/lib/api.ts
import { createClient } from "@packages/client"

export const api = createClient()
```

Pastikan `NEXT_PUBLIC_API_URL` sudah di-set di `.env`.

---

## Tipe Data

Semua tipe diimpor dari `@packages/validator` (Single Source of Truth):

```ts
import type {
  Role,
  CreateRole,
  UpdateRole,
  RoleQuery,
} from "@packages/validator"
```

### `Role`

```ts
{
  id: string          // UUID
  title: string       // 1–100 karakter
  description: string | null
  createdAt: string   // ISO datetime
  updatedAt: string   // ISO datetime
}
```

### `CreateRole`

```ts
{
  title: string               // wajib
  description?: string | null
}
```

### `UpdateRole`

```ts
{
  title?: string              // optional
  description?: string | null
}
```

### `RoleQuery`

```ts
{
  page?: number               // default 1
  limit?: number              // default 10, max 100
  search?: string             // pencarian di title (case-insensitive)
  title?: string              // alias search
  id?: string                 // filter exact UUID
}
```

---

## Method

### `list`

Mengambil daftar roles.

```ts
const roles: Role[] = await api.resources.roles.list()

// dengan pagination & search
const roles = await api.resources.roles.list({
  page: 1,
  limit: 20,
  search: "admin",
})
```

> Catatan: API mengembalikan data terpaginasi, client saat ini hanya mengembalikan array `data`.  
> Meta (`total`, `totalPages`, dll) belum diekspos.

---

### `get`

Mengambil detail satu role berdasarkan ID.

```ts
const role = await api.resources.roles.get("550e8400-e29b-41d4-a716-446655440000")
```

Throws `ApiError` (status 404) jika role tidak ditemukan.

---

### `create`

Membuat role baru.

```ts
const newRole = await api.resources.roles.create({
  title: "Editor",
  description: "Dapat mengedit dokumen organisasi",
})
```

- `title` wajib dan harus unik (case-insensitive).
- Throws `ApiError` status `409 CONFLICT` jika title sudah ada.

---

### `update`

Memperbarui role yang sudah ada.

```ts
const updated = await api.resources.roles.update(roleId, {
  title: "Senior Editor",
  description: "Hak akses lebih tinggi",
})
```

- Hanya field yang dikirim yang diubah.
- Throws `404` jika ID tidak ditemukan.
- Throws `409` jika title baru bentrok dengan role lain.

---

### `remove`

Menghapus role.

```ts
const deletedRole = await api.resources.roles.remove(roleId)
```

Mengembalikan data role yang baru saja dihapus.  
Throws `404` jika ID tidak ditemukan.

---

## Contoh Integrasi dengan Form

Contoh form create role menggunakan komponen dari `@packages/ui` + client:

```tsx
"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { ApiError } from "@packages/client"
import { CreateRoleSchema } from "@packages/validator"
import { FieldLayout, FieldSetLayout } from "@packages/ui/form/field-layout"
import { FieldInput } from "@packages/ui/form/field-input"
import { FieldTextArea } from "@packages/ui/form/field-textarea"
import { toast } from "@packages/ui/components/toast"

export function CreateRoleForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const raw = {
      title: String(formData.get("title") ?? ""),
      description: (formData.get("description") as string) || null,
    }

    // Validasi client-side (opsional tapi disarankan)
    const parsed = CreateRoleSchema.safeParse(raw)
    if (!parsed.success) {
      toast.add({
        title: "Validasi gagal",
        description: parsed.error.issues[0]?.message ?? "Data tidak valid",
      })
      return
    }

    setLoading(true)
    try {
      const role = await api.resources.roles.create(parsed.data)

      toast.add({
        title: "Berhasil",
        description: `Role "${role.title}" berhasil dibuat.`,
      })

      e.currentTarget.reset()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.add({
          title: "Gagal menyimpan",
          description: err.message, // contoh: Role "Editor" sudah ada
        })
      } else {
        toast.add({
          title: "Error jaringan",
          description: "Tidak dapat terhubung ke server",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <FieldLayout
      buttonLabel={loading ? "Menyimpan..." : "Simpan Role"}
      onSubmit={handleSubmit}
    >
      <FieldSetLayout
        legend="Buat Role Baru"
        description="Title harus unik (tidak case-sensitive)"
      >
        <FieldInput
          name="title"
          label="Nama Role"
          placeholder="cth. Editor"
          required
        />
        <FieldTextArea
          name="description"
          label="Deskripsi"
          placeholder="Penjelasan singkat peran ini"
        />
      </FieldSetLayout>
    </FieldLayout>
  )
}
```

---

## Error yang Umum Muncul

| Situasi                       | Status | Code         | Pesan contoh             |
| ----------------------------- | ------ | ------------ | ------------------------ |
| Title sudah ada               | 409    | `CONFLICT`   | `Role "admin" sudah ada` |
| ID tidak ditemukan            | 404    | `NOT_FOUND`  | `Role not found`         |
| Validasi gagal (title kosong) | 400    | `VALIDATION` | sesuai pesan Zod         |
| Server down / salah port      | -      | -            | `NetworkError`           |

Selalu tangkap `ApiError` untuk menampilkan pesan yang ramah ke user.

---

## Tips

1. **Validasi di dua sisi**  
   Biarkan client melakukan `.parse()` + tetap validasi di form (UX lebih baik).

2. **Gunakan toast untuk feedback**  
   Sudah tersedia di `@packages/ui/components/toast`.

3. **Jangan hardcode URL**  
   Selalu lewat `createClient()`.

4. **Untuk list + pagination UI**  
   Saat ini client hanya mengembalikan array. Jika Anda butuh `meta` (total, totalPages), perlu perluasan di `http.ts` / resource di masa depan.

5. **Testing**  
   Gunakan `@packages/testing` (factories + `createTestToken`) saat menulis test e2e.
