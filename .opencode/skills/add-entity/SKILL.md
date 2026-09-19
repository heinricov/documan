---
name: add-entity
description: Tambah entity baru lengkap di monorepo documan (Prisma model, Zod schemas, API client, NestJS module, testing factory, dan web routes). Gunakan saat user bilang "buat entity baru", "tambah entity", "add entity", "buat CRUD untuk", atau sejenisnya.
---

# Skill: Menambah Entity Baru di Documan

Ikuti urutan langkah di bawah ini **secara berurutan**. Jangan loncat. Setiap langkah harus selesai sebelum lanjut ke langkah berikutnya.

Gunakan nama entity yang diberikan user (contoh: `Partner`, `Document`, `DocType`). Ganti semua placeholder `Entity` / `entity` / `entities` sesuai nama tersebut (PascalCase / camelCase / plural).

**Total file yang biasanya dibuat/diubah: ~20 file baru + beberapa file modifikasi.**

---

## Overview Alur

```
1. packages/db          → Model Prisma + migration
2. packages/validator   → Zod schemas & types (SSOT)
3. packages/client      → Typed API client resource
4. apps/api             → NestJS module (controller + service + swagger)
5. packages/testing     → Factory + seed helper
6. apps/web             → Route + feature (opsional, tanya dulu)
```

---

## Langkah 1: Database (`packages/db`)

### 1.1 Tambah model di `packages/db/prisma/schema.prisma`

```prisma
model Entity {
  id        String   @id @default(uuid()) @db.Uuid
  // field-field lain sesuai kebutuhan
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("entities")   // nama tabel plural snake_case
}
```

**Konvensi wajib:**
- ID selalu `String @id @default(uuid()) @db.Uuid`
- Selalu ada `createdAt` dan `updatedAt`
- Pakai `@@map("table_name")` untuk nama tabel
- Field sensitif (password, token, dll) **jangan** dimasukkan ke response schema nanti

### 1.2 Jalankan migration

```bash
pnpm --filter @packages/db prisma:migrate
pnpm --filter @packages/db prisma:generate
```

---

## Langkah 2: Validation Schemas (`packages/validator`)

### 2.1 Buat file `packages/validator/src/schemas/entity.ts`

Harus ada **4 schema** + **4 type**:

```typescript
import { z } from "zod"

export const EntitySchema = z.object({
  id: z.string().uuid(),
  // field response (tanpa password/sensitif)
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateEntitySchema = z.object({
  // field yang boleh diisi saat create
})

export const UpdateEntitySchema = z.object({
  // field yang boleh diubah (semua optional)
})

export const EntityQuerySchema = z.object({
  id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type Entity = z.infer<typeof EntitySchema>
export type CreateEntity = z.infer<typeof CreateEntitySchema>
export type UpdateEntity = z.infer<typeof UpdateEntitySchema>
export type EntityQuery = z.infer<typeof EntityQuerySchema>
```

### 2.2 Export di `packages/validator/src/index.ts`

```typescript
export { EntitySchema, CreateEntitySchema, UpdateEntitySchema, EntityQuerySchema } from "./schemas/entity"
export type { Entity, CreateEntity, UpdateEntity, EntityQuery } from "./schemas/entity"
```

---

## Langkah 3: API Client (`packages/client`)

### 3.1 Buat `packages/client/src/resources/entities.ts`

```typescript
import { z } from "zod"
import type { Http } from "../http"
import {
  EntitySchema, CreateEntitySchema, UpdateEntitySchema, EntityQuerySchema,
  type Entity, type CreateEntity, type UpdateEntity
} from "@packages/validator"

export interface EntitiesResource {
  list(query?: z.input<typeof EntityQuerySchema>): Promise<Entity[]>
  get(id: string): Promise<Entity>
  create(data: CreateEntity): Promise<Entity>
  update(id: string, data: UpdateEntity): Promise<Entity>
  remove(id: string): Promise<Entity>
}

export function createEntitiesResource(http: Http): EntitiesResource {
  const path = "/entities"

  return {
    list(query) {
      const parsed = EntityQuerySchema.parse(query ?? {})
      return http.request(z.array(EntitySchema), path, { method: "GET", query: parsed as Record<string, unknown> })
    },
    get(id) {
      return http.request(EntitySchema, `${path}/${id}`, { method: "GET" })
    },
    create(data) {
      const parsed = CreateEntitySchema.parse(data)
      return http.request(EntitySchema, path, { method: "POST", body: parsed })
    },
    update(id, data) {
      const parsed = UpdateEntitySchema.parse(data)
      return http.request(EntitySchema, `${path}/${id}`, { method: "PATCH", body: parsed })
    },
    remove(id) {
      return http.request(EntitySchema, `${path}/${id}`, { method: "DELETE" })
    },
  }
}
```

### 3.2 Daftarkan di `packages/client/src/resources/index.ts`

Tambahkan ke interface `Resources` dan ke `createResources()`.

### 3.3 Export type di `packages/client/src/index.ts` jika diperlukan.

---

## Langkah 4: API Backend (`apps/api`)

Buat folder `apps/api/src/modules/entities/` berisi 4 file:

### 4.1 `entity.module.ts`
### 4.2 `entity.service.ts`
- Pakai `prisma` dari `@packages/db`
- Pakai `NotFoundError`, `ConflictError` dari `@packages/core`
- Pakai helper pagination dari `@packages/core`
- **Wajib** ada method `serialize()` yang mengubah `Date` → ISO string

### 4.3 `entity.controller.ts`
- Pakai decorator `@ZodQuery`, `@ZodBody`, `@ZodParams`
- Pakai schema dari `@packages/validator`
- Tambahkan Swagger decorator

### 4.4 `entity.swagger.ts`
```typescript
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"
import { EntitySchema, CreateEntitySchema, UpdateEntitySchema } from "@packages/validator"

export const entitySchema = zodToOpenApi(EntitySchema)
export const createEntitySchema = zodToOpenApi(CreateEntitySchema)
export const updateEntitySchema = zodToOpenApi(UpdateEntitySchema)
export const paginatedEntitySchema = paginatedOpenApiResponse(EntitySchema)
```

### 4.5 Daftarkan module di `apps/api/src/app.module.ts`

---

## Langkah 5: Testing (`packages/testing`)

### 5.1 Tambah factory di `packages/testing/src/factories.ts`
### 5.2 Tambah seed helper di `packages/testing/src/db.ts`
### 5.3 Update daftar tabel di `cleanDatabase` jika ada

---

## Langkah 6: Web Frontend (`apps/web`) — Opsional

Tanyakan dulu ke user apakah ingin dibuatkan juga halaman web-nya.
Jika ya:
- Tambah route constant
- Buat folder `apps/web/app/entities/` (atau sesuai naming)
- Buat list page + detail/create/edit page memakai `@packages/client` dan komponen dari `@packages/ui`

---

## Aturan Tambahan

1. **SSOT** — Semua schema & type hanya ada di `@packages/validator`. Jangan buat ulang di api atau web.
2. **Naming** — Ikuti pola yang sudah ada di `Role` / `User` / `Subsidiary`.
3. **Error handling** — Selalu pakai `NotFoundError` dan `ConflictError` dari `@packages/core`.
4. **Pagination** — Selalu gunakan helper `parseOffsetPagination`, `toPrismaArgs`, `calculatePaginationMeta`.
5. **Serialize Date** — Wajib convert `Date` ke ISO string di service sebelum dikembalikan.
6. Setelah selesai semua langkah, jalankan:
   ```bash
   pnpm typecheck
   pnpm --filter api test
   ```

Mulai sekarang dengan menanyakan nama entity dan field-field yang dibutuhkan, lalu kerjakan langkah 1.
