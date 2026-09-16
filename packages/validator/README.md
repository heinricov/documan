# @packages/validator

Shared validation schemas dan types menggunakan **Zod**. Single source of truth untuk validasi & type antara **web ↔ api**.

## Table of Contents

- [Setup](#setup)
- [Penggunaan](#penggunaan)
  - [Di apps/api (NestJS)](#di-appsapi-nestjs)
  - [Di apps/web (Next.js)](#di-appsweb-nextjs)
- [Schemas](#schemas)
  - [Role Schema](#role-schema)
- [Types](#types)
- [Menambah Schema Baru](#menambah-schema-baru)
- [Validasi Data](#validasi-data)
  - [Basic Parsing](#basic-parsing)
  - [Safe Parsing (tanpa error)](#safe-parsing-tanpa-error)
  - [Partial Validation](#partial-validation)
- [Integrasi dengan Prisma](#integrasi-dengan-prisma)
- [Best Practices](#best-practices)

---

## Setup

Package ini sudah terinstall sebagai dependency di `apps/api` dan `apps/web`.

```bash
# Jika perlu install ulang
pnpm install
```

---

## Penggunaan

### Di apps/api (NestJS)

**Contoh: Role Controller**

```typescript
import { Controller, Post, Body, Get, Put, Delete, Param } from "@nestjs/common"
import { CreateRoleSchema, UpdateRoleSchema, RoleQuerySchema } from "@packages/validator"
import type { CreateRole, UpdateRole } from "@packages/validator"

@Controller("roles")
export class RolesController {
  @Post()
  async create(@Body() body: unknown) {
    // Validasi request body
    const data = CreateRoleSchema.parse(body)

    // data bertipe CreateRole { title: string, description?: string | null }
    return this.rolesService.create(data)
  }

  @Get()
  async findAll(@Query() query: unknown) {
    // Validasi query parameters
    const params = RoleQuerySchema.parse(query)

    // params bertipe RoleQuery { page: number, limit: number, ... }
    return this.rolesService.findAll(params)
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    // Validasi ID dan body
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new BadRequestException("Invalid ID format")
    }

    const data = UpdateRoleSchema.parse(body)
    return this.rolesService.update(id, data)
  }
}
```

**Contoh: Validation Pipe (NestJS)**

```typescript
// main.ts
import { ValidationPipe } from "@nestjs/common"

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
)
```

### Di apps/web (Next.js)

**Contoh: Form Action**

```typescript
"use server"

import { CreateRoleSchema } from "@packages/validator"
import type { CreateRole } from "@packages/validator"

export async function createRole(formData: FormData) {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | null,
  }

  // Validasi sebelum kirim ke API
  const result = CreateRoleSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Kirim ke API
  const response = await fetch(`${process.env.API_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  })

  return response.json()
}
```

**Contoh: Client Component**

```tsx
"use client"

import { useState } from "react"
import { CreateRoleSchema } from "@packages/validator"
import type { CreateRole } from "@packages/validator"

export function RoleForm() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || null,
    }

    // Client-side validation
    const result = CreateRoleSchema.safeParse(data)

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    // Type-safe: result.data bertipe CreateRole
    const response = await fetch("/api/roles", {
      method: "POST",
      body: JSON.stringify(result.data),
    })

    // Handle response...
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" />
      {errors.title && <span>{errors.title[0]}</span>}
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## Schemas

### Common Schemas

#### `IdParamsSchema`

Schema param path `:id` — dipakai SEMUA endpoint yang menerima `{ id: uuid }`:

```typescript
import { IdParamsSchema } from "@packages/validator"

const params = IdParamsSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" })
// { id: string }
```

#### `PaginationMetaSchema`

Meta pagination standar: `{ page, limit, total, totalPages, hasNext, hasPrevious }`.

#### `paginatedResponseSchema(itemSchema)`

Bangun schema respons list terpaginasi generik dari schema item:

```typescript
import { paginatedResponseSchema, RoleSchema } from "@packages/validator"

const RoleListSchema = paginatedResponseSchema(RoleSchema)
// { success: true, data: Role[], meta: PaginationMeta }
```

### Role Schema

#### `RoleSchema`

Validasi data Role dari database:

```typescript
import { RoleSchema } from "@packages/validator"

const role = RoleSchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Admin",
  description: "Administrator role",
  createdAt: "2026-09-16T03:27:52.024Z",
  updatedAt: "2026-09-16T03:27:52.048Z"
})

// role: { id, title, description?: string | null, createdAt: string, updatedAt: string }
```

| Field         | Type             | Validasi         |
| ------------- | ---------------- | ---------------- |
| `id`          | `string`         | UUID format      |
| `title`       | `string`         | 1-100 characters |
| `description` | `string \| null` | Optional         |
| `createdAt`   | `string`         | ISO date-time    |
| `updatedAt`   | `string`         | ISO date-time    |

> Note: `createdAt`/`updatedAt` direpresentasikan sebagai **ISO string** (serialisasi dari `Date` milik database) — konsisten antara API response, klien web, dan schema.

#### `CreateRoleSchema`

Validasi untuk membuat Role baru:

```typescript
import { CreateRoleSchema } from "@packages/validator"

const data = CreateRoleSchema.parse({
  title: "Admin",
  description: "Administrator role" // optional
})

// data: { title: string, description?: string | null }
```

| Field         | Type             | Validasi                   |
| ------------- | ---------------- | -------------------------- |
| `title`       | `string`         | Required, 1-100 characters |
| `description` | `string \| null` | Optional                   |

#### `UpdateRoleSchema`

Validasi untuk update Role:

```typescript
import { UpdateRoleSchema } from "@packages/validator"

const data = UpdateRoleSchema.parse({
  title: "Super Admin" // optional, hanya update jika ada
})

// data: { title?: string, description?: string | null }
```

| Field         | Type             | Validasi                   |
| ------------- | ---------------- | -------------------------- |
| `title`       | `string`         | Optional, 1-100 characters |
| `description` | `string \| null` | Optional                   |

#### `RoleQuerySchema`

Validasi untuk query/list Roles:

```typescript
import { RoleQuerySchema } from "@packages/validator"

const query = RoleQuerySchema.parse({
  page: 1,
  limit: 10,
  search: "admin"
})

// query: { page: 1, limit: 10, search: "admin", id?: string, title?: string }
```

| Field    | Type     | Default | Validasi                  |
| -------- | -------- | ------- | ------------------------- |
| `id`     | `string` | -       | Optional, UUID            |
| `title`  | `string` | -       | Optional                  |
| `page`   | `number` | `1`     | Positive integer          |
| `limit`  | `number` | `10`    | Positive integer, max 100 |
| `search` | `string` | -       | Optional                  |

---

## Types

Semua types di-infer dari schemas menggunakan `z.infer<>`:

```typescript
import type {
  Role,        // Data dari database
  CreateRole,  // Data untuk create
  UpdateRole,  // Data untuk update
  RoleQuery    // Parameter query
} from "@packages/validator"
```

| Type         | Deskripsi                                                                       |
| ------------ | ------------------------------------------------------------------------------- |
| `Role`       | `{ id: string, title: string, createdAt: string, updatedAt: string, description?: string \| null }` |
| `CreateRole` | `{ title: string, description?: string \| null }`                               |
| `UpdateRole` | `{ title?: string, description?: string \| null }`                              |
| `RoleQuery`  | `{ id?: string, title?: string, page: number, limit: number, search?: string }` |

---

## Menambah Schema Baru

### 1. Buat file schema baru

```typescript
// src/schemas/user.ts
import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.coerce.date(),
})

export const CreateUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().min(1, "Name wajib diisi").max(100),
  role: z.enum(["admin", "user", "guest"]).default("user"),
})

export const UpdateUserSchema = z.object({
  email: z.string().email("Email tidak valid").optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["admin", "user", "guest"]).optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
```

### 2. Export di index.ts

```typescript
// src/index.ts
export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "./schemas/user.js"

export type {
  User,
  CreateUser,
  UpdateUser,
} from "./schemas/user.js"
```

---

## Validasi Data

### Basic Parsing

```typescript
import { CreateRoleSchema } from "@packages/validator"

// Akan throw error jika validasi gagal
const data = CreateRoleSchema.parse({
  title: "Admin",
  description: null
})
```

### Safe Parsing (tanpa error)

```typescript
import { CreateRoleSchema } from "@packages/validator"

const result = CreateRoleSchema.safeParse({
  title: "",
  description: null
})

if (result.success) {
  // result.data bertipe CreateRole
  console.log(result.data)
} else {
  // result.error berisi detail error
  console.error(result.error.flatten().fieldErrors)
  // { title: ["Title wajib diisi"] }
}
```

### Partial Validation

```typescript
import { z } from "zod"

// Buat partial schema untuk update
const PartialRoleSchema = UpdateRoleSchema.partial()

// Atau gunakan pick untuk validasi field tertentu
const TitleOnlySchema = CreateRoleSchema.pick({ title: true })
```

---

## Integrasi dengan Prisma

Schema validator dirancang untuk kompatibel dengan Prisma models:

```typescript
// packages/db/prisma/schema.prisma
model Role {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("roles")
}
```

```typescript
// packages/validator/src/schemas/role.ts
import { z } from "zod"

// Schema match dengan Prisma model; timestamps sebagai ISO string
export const RoleSchema = z.object({
  id: z.string().uuid(),           // UUID dari Prisma
  title: z.string().min(1),        // String required
  description: z.string().nullable(), // Nullable string
  createdAt: z.string().datetime(),  // dari Date → dipetakan ke ISO string di service
  updatedAt: z.string().datetime(),  // dari Date → dipetakan ke ISO string di service
})
```

**Tips:**

- Gunakan `z.string().uuid()` untuk UUID fields
- Gunakan `z.string().datetime()` untuk timestamp yang diserialisasi (API response) — service bertanggung jawab mapping `Date → ISO string`
- Gunakan `z.string().nullable()` untuk nullable fields
- Gunakan `z.number().int()` untuk Integer fields

---

## Best Practices

1. **Selalu validasi input** - Jangan percaya data dari client/server
2. **Gunakan safeParse** - Untuk handle error dengan gracefully
3. **Export types** - Gunakan `type` import untuk type safety
4. **Naming convention** - `XxxSchema` untuk schema, `Xxx` untuk type
5. **Keep it simple** - Jangan over-complicate schemas
6. **Document custom validations** - Jika ada validasi kompleks

---

## Troubleshooting

### Error: "Invalid input"

Pastikan data yang di-parse sesuai dengan schema:

```typescript
const result = CreateRoleSchema.safeParse(data)
if (!result.success) {
  console.error(result.error)
}
```

### Error: "Cannot find module"

Pastikan import path benar:

```typescript
// Benar
import { CreateRoleSchema } from "@packages/validator"

// Salah
import { CreateRoleSchema } from "@packages/validator/schemas/role"
```

### Error: Type mismatch

Pastikan menggunakan `type` import untuk types:

```typescript
// Benar
import { CreateRoleSchema } from "@packages/validator"
import type { CreateRole } from "@packages/validator"

// Salah
import { CreateRole } from "@packages/validator"
```
