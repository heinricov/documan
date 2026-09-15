# @packages/client

Typed API client untuk memanggil API dari web. Type-safe + response validation otomatis menggunakan schemas dari **@packages/validator**.

## Table of Contents

- [Setup](#setup)
- [Penggunaan](#penggunaan)
- [Resources](#resources)
  - [Roles](#roles)
- [Error Handling](#error-handling)
- [Custom Base URL](#custom-base-url)
- [Menambah Resource Baru](#menambah-resource-baru)
- [Arsitektur](#arsitektur)

---

## Setup

Pastikan `NEXT_PUBLIC_API_URL` ada di file `.env` root repo:

```bash
# .env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Package ini sudah terinstall di `apps/web`. Tanpa menulis fetch manual, langsung gunakan client:

```typescript
import { createClient } from "@packages/client"

const api = createClient()
```

---

## Penggunaan

```typescript
import { createClient } from "@packages/client"

const api = createClient()

// GET /roles → otomatis validasi response
const roles = await api.resources.roles.list()

// GET /roles/:id
const role = await api.resources.roles.get("550e8400-e29b-41d4-a716-446655440000")

// POST /roles → otomatis validasi input
const newRole = await api.resources.roles.create({
  title: "Admin",
  description: "Administrator role",
})

// PUT /roles/:id
const updated = await api.resources.roles.update(id, {
  title: "Super Admin",
})

// DELETE /roles/:id
await api.resources.roles.remove(id)
```

---

## Resources

### Roles

Semua input di-validasi dengan schema dari **@packages/validator** sebelum dikirim, dan response divalidasi saat diterima.

| Method | Deskripsi | Signature |
|--------|-----------|-----------|
| `list()` | Ambil semua roles | `list(query?: RoleQuery): Promise<Role[]>` |
| `get(id)` | Ambil satu role | `get(id: string): Promise<Role>` |
| `create(data)` | Buat role baru | `create(data: CreateRole): Promise<Role>` |
| `update(id, data)` | Update role | `update(id: string, data: UpdateRole): Promise<Role>` |
| `remove(id)` | Hapus role | `remove(id: string): Promise<void>` |

**Contoh list dengan query:**

```typescript
const roles = await api.resources.roles.list({
  page: 1,
  limit: 10,
  search: "admin",
})
```

---

## Error Handling

Client melempar error terstruktur:

| Error | Penyebab |
|-------|----------|
| `ApiError` | Response dari server gagal (HTTP 4xx/5xx) |
| `NetworkError` | Gagal terhubung ke server (network offline, timeout) |
| `ValidationError` | Response tidak sesuai schema (saat validasi response) |
| `ZodError` | Input tidak valid (saat validasi input request) |

```typescript
import { createClient, ApiError, NetworkError, ValidationError } from "@packages/client"

const api = createClient()

try {
  const roles = await api.resources.roles.list()
  console.log(roles)
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Server error: ${error.status} - ${error.message}`)
  } else if (error instanceof NetworkError) {
    console.error("Network error, server tidak bisa dijangkau")
  } else if (error instanceof ValidationError) {
    console.error("Response tidak valid:", error.errors)
  }
}
```

**Properti error:**

```typescript
// ApiError
error.status  // HTTP status code (404, 500, dll)
error.message // Pesan error dari server
error.data    // Raw response body

// NetworkError
error.message // Deskripsi error
error.cause   // Error asli dari fetch

// ValidationError
error.errors  // Zod issues detail
error.data    // Raw response yang gagal validasi
```

---

## Custom Base URL

Base URL diambil dari `NEXT_PUBLIC_API_URL`, tapi bisa di-override:

```typescript
const api = createClient({
  baseUrl: "https://api.example.com",
})
```

---

## Menambah Resource Baru

### 1. Buat schema di validator dulu

```typescript
// packages/validator/src/schemas/user.ts
export const UserSchema = z.object({ ... })
export const CreateUserSchema = z.object({ ... })
```

Export di `index.ts` validator.

### 2. Buat resource baru

```typescript
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
      return http.request(UserSchema, path, { method: "POST", body: parsed })
    },
  }
}
```

### 3. Daftarkan di resources/index.ts

```typescript
// packages/client/src/resources/index.ts
export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
    users: createUsersResource(http), // ← baru
  }
}
```

---

## Arsitektur

```
packages/client/
├── src/
│   ├── index.ts              # Export utama
│   ├── client.ts             # createClient() factory
│   ├── http.ts               # Core HTTP wrapper (fetch + error + validation)
│   └── resources/
│       ├── index.ts          # Daftar resources
│       └── roles.ts          # Role API methods
└── package.json
```

**Alur request:**
1. Client method dipanggil (misal `api.resources.roles.create(data)`)
2. Input divalidasi dengan schema (`CreateRoleSchema.parse(data)`)
3. Request dikirim via `fetch` ke `NEXT_PUBLIC_API_URL + path`
4. Response divalidasi dengan schema (`RoleSchema.parse(response)`)
5. Data type-safe dikembalikan ke caller

## Best Practices

1. **Jangan import `@packages/client/resources/*` langsung** - gunakan `@packages/client`
2. **Jangan menulis fetch manual** - selalu pakai client untuk konsistensi validasi
3. **Handle errors** - selalu tangkap `ApiError` dan `NetworkError`
4. **Gunakan di Server Components** - lebih aman karena `NEXT_PUBLIC_API_URL` ada di server
5. **Responses selalu divalidasi** - jangan bypass validasi