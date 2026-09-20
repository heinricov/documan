---
name: add-entity
description: Tambah entity baru lengkap di monorepo documan (Prisma model, Zod schemas, API client, NestJS module, testing factory, dan web routes). Gunakan saat user bilang "buat entity baru", "tambah entity", "add entity", "buat CRUD untuk", atau sejenisnya.
---

# Skill: Menambah Entity Baru di Documan

Ikuti urutan langkah di bawah ini **secara berurutan**. Jangan loncat. Setiap langkah harus selesai sebelum lanjut ke langkah berikutnya.

**WAJIB: Sebelum memulai, tanyakan ke user:**
1. **Nama entity** (contoh: `Box`, `Document`, `Category`)
2. **Field-field yang dibutuhkan** beserta tipenya (string, number, boolean, nullable, unique, dll)
3. **Apakah butuh web frontend?** (default: ya)

Contoh prompt yang benar:
> "Sebelum saya mulai, saya perlu tahu:
> 1. Nama entity-nya apa? (contoh: Box, Document, dll)
> 2. Field apa saja yang dibutuhkan? (contoh: noBox string unique, title string optional, description string optional)
> 3. Apakah perlu dibuatkan halaman web-nya juga?"

**Total file yang dibuat: ~15 file baru + beberapa file modifikasi**

---

## Overview Alur

```
1. packages/db          → Model Prisma + migration
2. packages/validator   → Zod schemas & types (SSOT)
3. packages/client      → Typed API client resource
4. apps/api             → NestJS module (controller + service + swagger)
5. packages/testing     → Factory + seed helper
6. apps/web             → Config objects + route pages (generic components)
```

---

## Langkah 1: Database (`packages/db`)

### 1.1 Tambah model di `packages/db/prisma/schema.prisma`

```prisma
model Entity {
  id          String   @id @default(uuid()) @db.Uuid
  // field-field lain sesuai kebutuhan
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("entities")   // nama tabel plural snake_case
}
```

**Konvensi wajib:**
- ID selalu `String @id @default(uuid()) @db.Uuid`
- Selalu ada `createdAt` dan `updatedAt`
- Pakai `@@map("table_name")` untuk nama tabel
- Field sensitif (password, token, dll) **jangan** dimasukkan ke response schema

### 1.2 Jalankan migration

```bash
pnpm --filter @packages/db prisma:migrate --name add_<entity>_model
pnpm --filter @packages/db prisma:generate
```

---

## Langkah 2: Validation Schemas (`packages/validator`)

### 2.1 Buat file `packages/validator/src/schemas/<entity>.ts`

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
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type Entity = z.infer<typeof EntitySchema>
export type CreateEntity = z.infer<typeof CreateEntitySchema>
export type UpdateEntity = z.infer<typeof UpdateEntitySchema>
export type EntityQuery = z.infer<typeof EntityQuerySchema>
```

### 2.2 Export di `packages/validator/src/index.ts`

```typescript
// ====================== Entity Schemas ======================
export { EntitySchema, CreateEntitySchema, UpdateEntitySchema, EntityQuerySchema } from "@packages/validator/schemas/<entity>"

// ====================== Entity Types ======================
export type { Entity, CreateEntity, UpdateEntity, EntityQuery } from "@packages/validator/schemas/<entity>"
```

---

## Langkah 3: API Client (`packages/client`)

### 3.1 Buat `packages/client/src/resources/<entities>.ts`

```typescript
import { z } from "zod"
import type { Http } from "../http"
import {
  EntitySchema, CreateEntitySchema, UpdateEntitySchema, EntityQuerySchema,
  type Entity, type CreateEntity, type UpdateEntity,
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
    get(id) { return http.request(EntitySchema, `${path}/${id}`, { method: "GET" }) },
    create(data) {
      const parsed = CreateEntitySchema.parse(data)
      return http.request(EntitySchema, path, { method: "POST", body: parsed })
    },
    update(id, data) {
      const parsed = UpdateEntitySchema.parse(data)
      return http.request(EntitySchema, `${path}/${id}`, { method: "PATCH", body: parsed })
    },
    remove(id) { return http.request(EntitySchema, `${path}/${id}`, { method: "DELETE" }) },
  }
}
```

### 3.2 Daftarkan di `packages/client/src/resources/index.ts`

Tambahkan ke interface `Resources` dan ke `createResources()`.

### 3.3 Export type di `packages/client/src/index.ts`

```typescript
export type { EntitiesResource } from "./resources/index"
```

---

## Langkah 4: API Backend (`apps/api`)

Buat folder `apps/api/src/modules/<entities>/` berisi 4 file:

### 4.1 `<entity>.module.ts`

```typescript
import { Module } from "@nestjs/common"
import { EntityController } from "./<entity>.controller.js"
import { EntityService } from "./<entity>.service.js"

@Module({
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntitiesModule {}
```

### 4.2 `<entity>.service.ts`

- Pakai `prisma` dari `@packages/db`
- Pakai `NotFoundError`, `ConflictError` dari `@packages/core`
- Pakai helper pagination: `parseOffsetPagination`, `toPrismaArgs`, `paginatedResponse`
- **Wajib** ada method `serialize()` yang mengubah `Date` → ISO string

### 4.3 `<entity>.controller.ts`

- Pakai decorator `@ZodQuery`, `@ZodBody`, `@ZodParams`
- Pakai schema dari `@packages/validator`
- Tambahkan Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiOkResponse`, dll)
- Jika entity sensitif (write-only untuk admin), tambahkan `@Roles("admin")`

### 4.4 `<entity>.swagger.ts`

```typescript
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"
import { EntitySchema, CreateEntitySchema, UpdateEntitySchema } from "@packages/validator"

export const entitySchema = zodToOpenApi(EntitySchema)
export const createEntitySchema = zodToOpenApi(CreateEntitySchema)
export const updateEntitySchema = zodToOpenApi(UpdateEntitySchema)
export const paginatedEntitySchema = paginatedOpenApiResponse(EntitySchema)
```

### 4.5 Daftarkan module di `apps/api/src/app.module.ts`

```typescript
import { EntitiesModule } from "./modules/<entities>/<entity>.module.js"

@Module({
  imports: [/* ...existing */, EntitiesModule],
})
```

---

## Langkah 5: Testing (`packages/testing`)

### 5.1 Tambah factory di `packages/testing/src/factories.ts`

```typescript
import type { CreateEntity } from "@packages/validator"

let entityCounter = 0

export interface EntityOverrides {
  // field overrides sesuai entity
}

export function createEntityFixture(overrides: EntityOverrides = {}): CreateEntity {
  entityCounter++
  return {
    // field dengan default value unik
    ...overrides,
  }
}

export function resetEntityCounter(): void { entityCounter = 0 }
```

### 5.2 Tambah seed helper di `packages/testing/src/db.ts`

```typescript
export async function seedEntity(overrides: EntityOverrides = {}, db: Db = defaultPrisma): Promise<Entity> {
  const data = createEntityFixture(overrides)
  return serializeEntity(await db.entity.create({ data: { ... } }))
}
```

### 5.3 Export di `packages/testing/src/index.ts`

```typescript
export { createEntityFixture, resetEntityCounter } from "./factories.js"
export type { EntityOverrides } from "./factories.js"
export { seedEntity, seedEntities } from "./db.js"
```

---

## Langkah 6: Web Frontend (`apps/web`)

Web menggunakan **generic components** — tidak perlu copy-paste. Cukup definisikan config objects.

### 6.1 Tambah route constant

```typescript
// apps/web/lib/constants.ts
export const ROUTES = {
  // ...existing
  entity: "/dashboard/<entity>",
} as const
```

### 6.2 Buat feature hooks

```
apps/web/features/<entity>/hooks/
├── use-<entity>.ts     ← useEntity(id) — wrapper thin dari useEntityItem
├── use-<entities>.ts   ← useEntities() — wrapper thin dari useEntityList
└── index.ts
```

Contoh `use-entity.ts`:

```typescript
"use client"
import { useCallback } from "react"
import type { Entity } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export function useEntity(id: string | undefined) {
  const getter = useCallback((entityId: string) => api.resources.entities.get(entityId), [])
  const { item, ...rest } = useEntityItem(id, getter, "entity")
  return { entity: item, ...rest }
}
```

### 6.3 Buat feature components (config objects)

```
apps/web/features/<entity>/components/
├── form-<entity>.tsx    ← Config + <EntityForm>
├── table-<entity>.tsx   ← Config + <EntityTable>
└── index.ts
```

**EntityForm** — cukup config, tidak ada copy-paste:

```typescript
"use client"
import { CreateEntitySchema, UpdateEntitySchema, type Entity } from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Entity",
  entityNamePlural: "Entities",
  baseUrl: ROUTES.entity,
  createSchema: CreateEntitySchema,
  updateSchema: UpdateEntitySchema,
  createFn: (data) => api.resources.entities.create(data as { ... }),
  updateFn: (id, data) => api.resources.entities.update(id, data as { ... }),
  fields: [
    { name: "fieldName", label: "Label", required: true },
    { name: "optionalField", label: "Optional Field" },
    { name: "description", label: "Deskripsi", render: "textarea", maxLength: 200 },
    // Untuk select field:
    { name: "type", render: "select", label: "Tipe", options: [...], required: true },
  ],
}

export function FormEntity({ mode, entityId, initialData }: {
  mode?: "create" | "edit"
  entityId?: string
  initialData?: Pick<Entity, "field1" | "field2">
}) {
  return <EntityForm config={config} mode={mode} entityId={entityId} initialData={initialData} />
}
```

**Field render types yang didukung EntityForm:**
- `"input"` — default. Text, email, password, number
- `"textarea"` — long text (description, catatan)
- `"select"` — dropdown pilihan (wajib sertakan `options`)

**EntityTable** — config + columns:

```typescript
"use client"
import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Entity } from "@packages/validator"
import { Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants"
import { useEntities } from "../hooks/use-entities"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Entity>[] = [
  ColumnSortDataTable<Entity>({ accessorKey: "fieldName", label: "Label" }),
  ColumnSortDataTable<Entity>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Entity>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataEntity() {
  const router = useRouter()
  const { entities, isLoading, error, deleteEntity } = useEntities()

  const config: EntityTableConfig<Entity> = useMemo(() => ({
    items: entities, isLoading, error, removeItem: deleteEntity, columns,
    getRowId: (e) => e.id, getRowLabel: (e) => e.fieldName,
    entityName: "Entity", entityNamePlural: "entities", title: "Entities",
    icon: <Icon className="size-4 text-muted-foreground" />,
    description: `${entities.length} entities in your workspace`,
    searchColumnId: ["fieldName"],
    searchPlaceholder: "Search entities...",
    columnLabels: { fieldName: "Label", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat..." : (error ?? "No results."),
    primaryAction: { title: "New Entity", onClick: () => router.push(`${ROUTES.entity}/add`) },
    rowActions: (entity) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.entity}/${entity.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.entity}/${entity.id}/view`) },
    ],
  }), [entities, isLoading, error, deleteEntity, router])

  return <EntityTable config={config} />
}
```

### 6.4 Buat route pages

```
apps/web/app/dashboard/<entity>/
├── page.tsx                 ← <TableDataEntity />
├── add/page.tsx             ← <FormEntity />
└── [id]/
    ├── edit/page.tsx        ← <EntityEditPage> + <FormEntity mode="edit" />
    └── view/page.tsx        ← <EntityForm mode="view" />
```

**View page** — menggunakan `EntityForm mode="view"` (read-only):

```typescript
"use client"
import { useParams } from "next/navigation"
import { useEntity } from "@/features/<entity>/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Entity", entityNamePlural: "Entities", baseUrl: ROUTES.entity,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {}, updateFn: async () => {},
  fields: [
    { name: "fieldName", label: "Label" },
  ],
}

export default function ViewEntityPage() {
  const params = useParams<{ id: string }>()
  const { entity, isLoading, error } = useEntity(params?.id)

  if (isLoading) return <section className="flex min-h-svh items-center justify-center"><p>Memuat...</p></section>
  if (error || !entity) return <section className="flex min-h-svh items-center justify-center"><p className="text-destructive">{error ?? "Tidak ditemukan."}</p></section>

  return <EntityForm config={config} mode="view" entityId={entity.id} initialData={entity} />
}
```

**Edit page** — menggunakan `EntityEditPage` wrapper:

```typescript
"use client"
import { useParams } from "next/navigation"
import { useEntity } from "@/features/<entity>/hooks"
import { FormEntity } from "@/features/<entity>/components"
import { ROUTES } from "@/lib/constants"
import { EntityEditPage, type EntityEditPageConfig } from "@/components/entity"

export default function EditEntityPage() {
  const params = useParams<{ id: string }>()
  const { entity, isLoading, error } = useEntity(params?.id)

  const config: EntityEditPageConfig = {
    item: entity, isLoading, error,
    entityName: "entity", baseUrl: ROUTES.entity,
    children: entity ? <FormEntity mode="edit" entityId={entity.id} initialData={entity} /> : null,
  }

  return <EntityEditPage config={config} />
}
```

### 6.5 Tambah menu di dashboard layout

```typescript
// apps/web/app/dashboard/layout.tsx
items: [
  // ...existing
  { title: "Entity", url: "/dashboard/<entity>" },
]
```

---

## Langkah 7: Seed & Clean Default Data (`packages/db`)

### 7.1 Buat file seed `packages/db/scripts/seed/<entities>.ts`

```typescript
import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

const DEFAULT_ENTITIES = [
  { field1: "value1", field2: "value2" },
] as const

export async function seedEntities(): Promise<void> {
  let inserted = 0
  for (const entity of DEFAULT_ENTITIES) {
    const existing = await prisma.entity.findFirst({ where: { field1: entity.field1 } })
    if (existing) continue
    await prisma.entity.create({ data: { ...entity } })
    inserted++
  }
  process.stdout.write(`Seed entities selesai: ${inserted} entity dibuat.\n`)
}

runScript("Seed entities", import.meta.url, seedEntities)
```

### 7.2 Buat file clean `packages/db/scripts/clean/<entities>.ts`

```typescript
import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

export async function cleanEntities(): Promise<void> {
  await cleanTable("entities")
}

runScript("Clean entities", import.meta.url, cleanEntities)
```

### 7.3 Daftarkan di `index.ts` & `package.json`

- Tambahkan `seedEntities` ke array `SEEDERS` di `packages/db/scripts/seed/index.ts`
- Tambahkan `"entities"` ke `TABLES` di `packages/db/scripts/lib/clean-table.ts`
- Tambahkan script `db:seed:<entities>` & `db:clean:<entities>` di `packages/db/package.json`

---

## Checklist Lengkap

| # | File | Aksi |
|---|------|------|
| 1 | `packages/db/prisma/schema.prisma` | Tambah model |
| 2 | `packages/validator/src/schemas/<entity>.ts` | **Buat baru** |
| 3 | `packages/validator/src/index.ts` | Tambah export |
| 4 | `packages/client/src/resources/<entities>.ts` | **Buat baru** |
| 5 | `packages/client/src/resources/index.ts` | Tambah ke Resources |
| 6 | `packages/client/src/index.ts` | Tambah export type |
| 7 | `apps/api/src/modules/<entities>/<entity>.module.ts` | **Buat baru** |
| 8 | `apps/api/src/modules/<entities>/<entity>.service.ts` | **Buat baru** |
| 9 | `apps/api/src/modules/<entities>/<entity>.controller.ts` | **Buat baru** |
| 10 | `apps/api/src/modules/<entities>/<entity>.swagger.ts` | **Buat baru** |
| 11 | `apps/api/src/app.module.ts` | Tambah import module |
| 12 | `packages/testing/src/factories.ts` | Tambah factory |
| 13 | `packages/testing/src/db.ts` | Tambah seed + serialize |
| 14 | `packages/testing/src/index.ts` | Tambah export |
| 15 | `apps/web/lib/constants.ts` | Tambah ke ROUTES |
| 16 | `apps/web/features/<entity>/hooks/` | **Buat baru** (useEntityItem wrapper) |
| 17 | `apps/web/features/<entity>/components/` | **Buat baru** (config objects) |
| 18 | `apps/web/app/dashboard/<entity>/` | **Buat baru** (route pages) |
| 19 | `apps/web/app/dashboard/layout.tsx` | Tambah menu |
| 20 | `packages/db/scripts/seed/<entities>.ts` | **Buat baru** |
| 21 | `packages/db/scripts/clean/<entities>.ts` | **Buat baru** |
| 22 | `packages/db/scripts/seed/index.ts` | Tambah ke SEEDERS |
| 23 | `packages/db/scripts/lib/clean-table.ts` | Tambah ke TABLES |
| 24 | `packages/db/package.json` | Tambah script |

---

## Aturan Tambahan

1. **SSOT** — Semua schema & type hanya ada di `@packages/validator`. Jangan buat ulang di api atau web.
2. **Naming** — Ikuti pola yang sudah ada di `Role` / `User` / `Subsidiary` / `Box`.
3. **Error handling** — Selalu pakai `NotFoundError` dan `ConflictError` dari `@packages/core`.
4. **Pagination** — Selalu gunakan helper `parseOffsetPagination`, `toPrismaArgs`, `paginatedResponse`.
5. **Serialize Date** — Wajib convert `Date` ke ISO string di service sebelum dikembalikan.
6. **Web Frontend** — Gunakan generic components (`EntityForm`, `EntityTable`, `EntityEditPage`). Cukup definisikan config objects, tidak perlu copy-paste boilerplate.
7. Setelah selesai semua langkah, jalankan:

```bash
pnpm --filter web typecheck
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api test:e2e
```
