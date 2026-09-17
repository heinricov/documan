# @packages/client

Typed API client untuk memanggil REST API Documan dari aplikasi web (Next.js).  
Type-safe + validasi request/response otomatis menggunakan schema dari **@packages/validator**.

Client ini adalah **satu-satunya cara resmi** untuk berkomunikasi dengan `apps/api` dari sisi web.

---

## Daftar Isi

- [Setup](#setup)
- [Penggunaan Dasar](#penggunaan-dasar)
- [Resources](#resources)
  - [Roles](#roles)
- [Error Handling](#error-handling)
- [Custom Base URL](#custom-base-url)
- [Menambah Resource Baru](#menambah-resource-baru)
- [Arsitektur](#arsitektur)
- [Best Practices](#best-practices)

---

## Setup

Pastikan environment variable berikut ada di file `.env` root monorepo:

```bash
# .env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

> Port default API di dokumentasi proyek adalah `4000`. Sesuaikan dengan `API_PORT` Anda.

Package sudah terdaftar sebagai dependency di `apps/web`:

```json
"@packages/client": "workspace:*"
```

---

## Penggunaan Dasar

```ts
import { createClient } from "@packages/client"

const api = createClient()

// List roles
const roles = await api.resources.roles.list()

// Ambil satu role
const role = await api.resources.roles.get("550e8400-e29b-41d4-a716-446655440000")

// Buat role baru
const newRole = await api.resources.roles.create({
  title: "Editor",
  description: "Bisa mengedit dokumen",
})

// Update role
const updated = await api.resources.roles.update(newRole.id, {
  title: "Senior Editor",
})

// Hapus role
const deleted = await api.resources.roles.remove(newRole.id)
```

---

## Resources

### Roles

Semua method otomatis memvalidasi **input** (sebelum dikirim) dan **response** (setelah diterima) menggunakan schema dari `@packages/validator`.

| Method | Deskripsi | Signature |
|--------|-----------|-----------|
| `list(query?)` | Ambil daftar roles (paginated di API, client mengembalikan array) | `list(query?: RoleQuery): Promise<Role[]>` |
| `get(id)` | Ambil detail satu role | `get(id: string): Promise<Role>` |
| `create(data)` | Buat role baru | `create(data: CreateRole): Promise<Role>` |
| `update(id, data)` | Perbarui role | `update(id: string, data: UpdateRole): Promise<Role>` |
| `remove(id)` | Hapus role | `remove(id: string): Promise<Role>` |

#### Contoh `list` dengan query

```ts
const roles = await api.resources.roles.list({
  page: 1,
  limit: 10,
  search: "admin",
})
```

Parameter yang didukung (`RoleQuery`):

- `page` (number, default 1)
- `limit` (number, max 100, default 10)
- `search` / `title` (string, pencarian case-insensitive)
- `id` (uuid, filter exact)

Dokumentasi detail penggunaan roles → lihat [role.md](./role.md).

---

## Error Handling

Client melempar error terstruktur:

| Error | Kapan terjadi |
|-------|---------------|
| `ApiError` | Server mengembalikan HTTP 4xx/5xx |
| `NetworkError` | Gagal terhubung ke server (offline, timeout, CORS, dll) |
| `ValidationError` | Response tidak sesuai schema Zod |
| `ZodError` | Input request tidak valid (dari `.parse()`) |

```ts
import { createClient, ApiError, NetworkError, ValidationError } from "@packages/client"

const api = createClient()

try {
  const roles = await api.resources.roles.list()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Server error [${error.status}] ${error.code ?? ""}: ${error.message}`)
    // error.data berisi raw body dari server
  } else if (error instanceof NetworkError) {
    console.error("Tidak bisa terhubung ke API:", error.message)
  } else if (error instanceof ValidationError) {
    console.error("Response tidak valid:", error.errors)
  } else {
    console.error("Unexpected error:", error)
  }
}
```

**Properti penting:**

```ts
// ApiError
error.status   // number (404, 409, 500, ...)
error.message  // string (pesan dari server)
error.code     // string | undefined (CONFLICT, NOT_FOUND, ...)
error.data     // unknown (raw response body)

// NetworkError
error.message
error.cause

// ValidationError
error.errors   // ZodIssue[]
error.data     // data yang gagal divalidasi
```

---

## Custom Base URL

Secara default client membaca `process.env.NEXT_PUBLIC_API_URL`.  
Anda bisa override:

```ts
const api = createClient({
  baseUrl: "https://api.example.com",
})
```

---

## Menambah Resource Baru

### 1. Buat schema di `@packages/validator` terlebih dahulu

```ts
// packages/validator/src/schemas/user.ts
export const UserSchema = z.object({ ... })
export const CreateUserSchema = z.object({ ... })
export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
```

Export dari `packages/validator/src/index.ts`.

### 2. Buat resource file

```ts
// packages/client/src/resources/users.ts
import { z } from "zod"
import type { Http } from "../http.js"
import { UserSchema, CreateUserSchema } from "@packages/validator"
import type { User, CreateUser } from "@packages/validator"

export interface UsersResource {
  list(): Promise<User[]>
  create(data: CreateUser): Promise<User>
}

export function createUsersResource(http: Http): UsersResource {
  const path = "/users"

  return {
    list() {
      return http.request(z.array(UserSchema), path, { method: "GET" })
    },
    create(data) {
      const parsed = CreateUserSchema.parse(data)
      return http.request(UserSchema, path, {
        method: "POST",
        body: parsed,
      })
    },
  }
}
```

### 3. Daftarkan di `resources/index.ts`

```ts
import { createUsersResource } from "./users.js"
import type { UsersResource } from "./users.js"

export interface Resources {
  roles: RolesResource
  users: UsersResource   // ← tambahkan
}

export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
    users: createUsersResource(http),
  }
}
```

---

## Arsitektur

```
packages/client/
├── src/
│   ├── index.ts              # Public exports
│   ├── client.ts             # createClient() factory
│   ├── http.ts               # Fetch wrapper + unwrap response + error handling
│   └── resources/
│       ├── index.ts          # Aggregator resources
│       └── roles.ts          # Roles API methods
└── package.json
```

**Alur request:**

1. Method resource dipanggil (`api.resources.roles.create(data)`)
2. Input divalidasi dengan Zod schema (`CreateRoleSchema.parse`)
3. Request dikirim via `fetch` ke `NEXT_PUBLIC_API_URL + path`
4. Response di-**unwrap** dari format standar API (`{ success: true, data: T }`)
5. Data hasil unwrap divalidasi lagi dengan schema response
6. Data type-safe dikembalikan ke caller

> **Penting:** Client secara otomatis meng-unwrap format respons `@packages/core`.  
> Anda tidak perlu menangani `{ success, data, meta }` secara manual.

---

## Best Practices

1. **Jangan import path internal**  
   Gunakan hanya `@packages/client`, jangan `@packages/client/resources/*`.

2. **Jangan menulis `fetch` manual**  
   Selalu lewat client agar validasi & error handling konsisten.

3. **Tangani error dengan benar**  
   Selalu `try/catch` dan bedakan `ApiError` vs `NetworkError`.

4. **Gunakan di Server Component bila memungkinkan**  
   Lebih aman dan menghindari CORS issues di development.

5. **Jangan bypass validasi**  
   Biarkan client melakukan `.parse()` — itu yang menjaga type-safety.

6. **Satu instance client**  
   Buat sekali di `lib/api.ts` lalu import di mana-mana:

   ```ts
   // apps/web/lib/api.ts
   import { createClient } from "@packages/client"
   export const api = createClient()
   ```

---

## Catatan Teknis

- Method update memakai **`PATCH`** (sesuai endpoint API).
- `list()` mengembalikan `Role[]` (data saja). Meta pagination saat ini tidak diekspos. Jika Anda membutuhkan `meta`, perlu diperluas di masa depan.
- `remove()` mengembalikan `Role` yang dihapus (bukan `void`).
